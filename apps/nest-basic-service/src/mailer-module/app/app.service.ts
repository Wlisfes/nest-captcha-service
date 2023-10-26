import { Injectable } from '@nestjs/common'
import { Brackets } from 'typeorm'
import { CoreService } from '@/core/core.service'
import { RedisService } from '@/core/redis.service'
import { EntityService } from '@/core/entity.service'
import { divineResult } from '@/utils/utils-common'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineOmitDatePatter } from '@/utils/utils-process'
import * as cache from '@/mailer-module/config/common-redis.resolver'
import * as http from '@/mailer-module/interface/app.interface'

@Injectable()
export class AppService extends CoreService {
	constructor(private readonly entity: EntityService, private readonly redisService: RedisService) {
		super()
	}

	/**创建应用**/
	public async httpCreateApplication(props: http.CreateApplication, uid: number) {
		return await this.RunCatch(async i18n => {
			const user = await this.validator({
				model: this.entity.user,
				name: '账号',
				empty: { value: true },
				close: { value: true },
				delete: { value: true },
				options: { where: { uid } }
			})
			const node = await this.entity.mailerApplication.create({
				appId: await this.createCustomUidByte(),
				appSecret: await this.createCustomByte(32),
				name: props.name,
				user
			})
			return await this.entity.mailerApplication.save(node).then(async data => {
				/**应用创建成功后添加redis缓存**/
				await this.redisService.setStore(cache.createMailerAppCache(data.appId), {
					userId: uid,
					appId: data.appId,
					name: data.name,
					appSecret: data.appSecret,
					status: data.status,
					bucket: data.bucket,
					ip: data.ip,
					host: null,
					port: null,
					secure: null,
					username: null,
					password: null,
					type: null
				})
				return await divineResult({ message: '创建成功' })
			})
		})
	}

	/**编辑授权地址**/
	public async httpUpdateBucket(props: http.UpdateBucket, uid: number) {
		return await this.RunCatch(async i18n => {
			const app = await this.validator({
				model: this.entity.mailerApplication,
				name: '应用',
				empty: { value: true },
				close: { value: true },
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: { user: 'tb.user' }
					},
					where: new Brackets(qb => {
						qb.where('tb.appId = :appId', { appId: props.appId })
						qb.andWhere('user.uid = :uid', { uid })
					})
				}
			})
			await this.entity.mailerApplication.update({ appId: props.appId }, { bucket: props.bucket, ip: props.ip }).then(async data => {
				/**应用编辑后需要更新redis缓存**/
				const node = await this.redisService.getStore<typeof app>(cache.createMailerAppCache(props.appId))
				return await this.redisService.setStore(cache.createMailerAppCache(props.appId), {
					...node,
					ip: props.ip,
					bucket: props.bucket
				})
			})
			return await divineResult({ message: '编辑成功' })
		})
	}

	/**应用列表**/
	public async httpColumnApplication(props: http.ColumnApplication, uid: number) {
		return await this.RunCatch(async i18n => {
			const { total, list } = await this.batchValidator({
				model: this.entity.mailerApplication,
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: { user: 'tb.user' }
					},
					where: new Brackets(qb => {
						qb.where('user.uid = :uid', { uid })
					}),
					order: { createTime: 'DESC' },
					skip: (props.page - 1) * props.size,
					take: props.size
				}
			})
			return await divineResult({ size: props.size, page: props.page, total, list })
		})
	}

	/**应用下拉列表**/
	public async httpSelecterApplication(uid: number) {
		return await this.RunCatch(async i18n => {
			const { total, list } = await this.batchValidator({
				model: this.entity.mailerApplication,
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: { user: 'tb.user' }
					},
					select: ['id', 'appId', 'name', 'status'],
					where: new Brackets(qb => {
						qb.where('user.uid = :uid', { uid })
					}),
					order: { createTime: 'DESC' }
				}
			})
			return await divineResult({
				total,
				list: list.map(item => divineOmitDatePatter(item, ['user']))
			})
		})
	}

	/**应用信息**/
	public async httpBasicApplication(props: http.BasicApplication, uid: number) {
		return await this.RunCatch(async i18n => {
			return await this.validator({
				model: this.entity.mailerApplication,
				name: '应用',
				empty: { value: true },
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: {
							user: 'tb.user',
							service: 'tb.service'
						}
					},
					where: new Brackets(qb => {
						qb.where('tb.appId = :appId', { appId: props.appId })
						qb.andWhere('user.uid = :uid', { uid })
					})
				}
			})
		})
	}

	/**修改应用名称**/
	public async httpUpdateNameApplication(props: http.UpdateNameApplication, uid: number) {
		return await this.RunCatch(async i18n => {
			return await this.validator({
				model: this.entity.mailerApplication,
				name: '应用',
				empty: { value: true },
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: { user: 'tb.user' }
					},
					where: new Brackets(qb => {
						qb.where('tb.appId = :appId', { appId: props.appId })
						qb.andWhere('user.uid = :uid', { uid })
					})
				}
			}).then(async data => {
				/**验证当前应用名称是否已存在**/
				await this.useResearch({
					model: this.entity.mailerApplication,
					options: {
						join: { alias: 'tb', leftJoinAndSelect: { user: 'tb.user' } },
						where: new Brackets(qb => {
							qb.where('tb.name = :name', { name: props.name })
							qb.andWhere('user.uid = :uid', { uid })
						})
					}
				}).then(async app => {
					await divineCatchWherer(app.appId !== props.appId, { message: `应用已存在` })
				})
				/**更新表数据**/
				await this.entity.mailerApplication.update({ appId: data.appId }, { name: props.name }).then(async () => {
					/**应用编辑后需要更新redis缓存**/
					const node = await this.redisService.getStore<typeof data>(cache.createMailerAppCache(props.appId))
					return await this.redisService.setStore(cache.createMailerAppCache(props.appId), {
						...node,
						name: props.name
					})
				})
				return await divineResult({ message: '编辑成功' })
			})
		})
	}

	/**重置appSecret**/
	public async httpResetMailerAppSecret(props: http.ResetMailerAppSecret, uid: number) {
		return await this.RunCatch(async i18n => {
			const app = await this.validator({
				model: this.entity.mailerApplication,
				name: '应用',
				empty: { value: true },
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: { user: 'tb.user' }
					},
					where: new Brackets(qb => {
						qb.where('tb.appId = :appId', { appId: props.appId })
						qb.andWhere('user.uid = :uid', { uid })
					})
				}
			})
			const appSecret = await this.createCustomByte(32)
			await this.entity.mailerApplication.update({ appId: app.appId }, { appSecret: appSecret }).then(async data => {
				/**应用编辑后需要更新redis缓存**/
				const node = await this.redisService.getStore<typeof app>(cache.createMailerAppCache(props.appId))
				return await this.redisService.setStore(cache.createMailerAppCache(props.appId), {
					...node,
					appSecret: appSecret
				})
			})
			return await divineResult({ message: '重置成功' })
		})
	}

	/**添加、修改应用SMTP服务**/
	public async httpUpdateMailerService(props: http.UpdateMailerService, uid: number) {
		return await this.RunCatch(async i18n => {
			return await this.validator({
				model: this.entity.mailerApplication,
				name: '应用',
				empty: { value: true },
				options: {
					join: {
						alias: 'tb',
						leftJoinAndSelect: {
							user: 'tb.user',
							service: 'tb.service'
						}
					},
					where: new Brackets(qb => {
						qb.where('tb.appId = :appId', { appId: props.appId })
						qb.andWhere('user.uid = :uid', { uid })
					})
				}
			}).then(async data => {
				console.log(data, props)
				if (data.service) {
					await this.entity.mailerService.update(
						{ id: data.service.id },
						{
							host: props.host ?? data.service.host,
							port: props.port ?? data.service.port,
							secure: props.secure ?? data.service.secure,
							username: props.username ?? data.service.username,
							password: props.password ?? data.service.password,
							type: props.type ?? data.service.type
						}
					)
					await this.entity.mailerApplication.update({ id: data.id }, { status: 'activated' }).then(async () => {
						/**应用编辑后需要更新redis缓存**/
						const node = await this.redisService.getStore<typeof data>(cache.createMailerAppCache(props.appId))
						return await this.redisService.setStore(cache.createMailerAppCache(props.appId), {
							...node,
							status: 'activated',
							host: props.host ?? data.service.host,
							port: props.port ?? data.service.port,
							secure: props.secure ?? data.service.secure,
							username: props.username ?? data.service.username,
							password: props.password ?? data.service.password,
							type: props.type ?? data.service.type
						})
					})
					return await divineResult({ message: '编辑成功' })
				}
				const node = await this.entity.mailerService.create({
					host: props.host,
					port: props.port,
					secure: props.secure,
					username: props.username,
					password: props.password,
					type: props.type,
					app: data,
					user: await this.entity.user.findOne({ where: { uid } })
				})
				await this.entity.mailerService.save(node)
				await this.entity.mailerApplication.update({ id: data.id }, { status: 'activated' }).then(async () => {
					/**应用编辑后需要更新redis缓存**/
					const node = await this.redisService.getStore<typeof data>(cache.createMailerAppCache(props.appId))
					return await this.redisService.setStore(cache.createMailerAppCache(props.appId), {
						...node,
						status: 'activated',
						host: props.host,
						port: props.port,
						secure: props.secure,
						username: props.username,
						password: props.password,
						type: props.type
					})
				})
				return await divineResult({ message: '激活成功' })
			})
		})
	}
}