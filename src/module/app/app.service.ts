import { Injectable } from '@nestjs/common'
import { CoreService } from '@/core/core.service'
import { EntityService } from '@/core/entity.service'
import * as http from '@/interface/app.interface'

@Injectable()
export class AppService extends CoreService {
	constructor(private readonly entity: EntityService) {
		super()
	}

	/**创建应用**/
	public async httpCreateApp(props: http.RequestCreateApp) {
		return await this.RunCatch(async i18n => {
			const node = await this.entity.appModel.create({
				uid: Date.now(),
				name: props.name,
				appKey: await this.createCustomByte(18),
				appSecret: await this.createCustomByte(64)
			})
			return await this.entity.appModel.save(node).then(async () => {
				return { message: '注册成功' }
			})
		})
	}

	/**编辑授权地址**/
	public async httpUpdateBucket(props: http.RequestUpdateBucket) {
		return await this.RunCatch(async i18n => {
			await this.validator({
				model: this.entity.appModel,
				name: '应用',
				empty: { value: true },
				close: { value: true },
				options: { where: { appKey: props.appKey } }
			})
			return await this.entity.appModel.update({ appKey: props.appKey }, { bucket: props.bucket }).then(() => {
				return { message: '编辑成功' }
			})
		})
	}

	/**应用信息**/
	public async httpBasicApp(props: http.RequestBasicApp) {
		return await this.RunCatch(async i18n => {
			return await this.validator({
				model: this.entity.appModel,
				name: '应用',
				empty: { value: true },
				options: { where: { appKey: props.appKey } }
			})
		})
	}
}
