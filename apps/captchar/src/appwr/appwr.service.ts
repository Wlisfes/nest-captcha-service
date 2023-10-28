import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Brackets } from 'typeorm'
import { CustomService } from '@/module/configer/custom.service'
import { divineIntNumber, divineIntStringer, divineResult } from '@/utils/utils-common'
import { TableCustomer } from '@/entity/tb-common.customer'
import { TableCaptcharAppwr } from '@/entity/tb-common.captchar__appwr'
import * as http from '@captchar/interface/appwr.resolver'

@Injectable()
export class AppwrService extends CustomService {
	constructor(
		@InjectRepository(TableCustomer) public readonly tableCustomer: Repository<TableCustomer>,
		@InjectRepository(TableCaptcharAppwr) public readonly tableCaptcharAppwr: Repository<TableCaptcharAppwr>
	) {
		super()
	}

	/**创建应用**/
	public async httpCreateAppwr(state: http.CreateAppwr, uid: string) {
		return await this.validator(this.tableCustomer, {
			message: '账户不存在',
			join: { alias: 'tb' },
			where: new Brackets(qb => {
				qb.where('tb.uid = :uid', { uid })
				qb.andWhere('tb.status IN(:...status)', { status: ['enable', 'disable'] })
			})
		}).then(async data => {
			await this.customeCreate(this.tableCaptcharAppwr, {
				name: state.name,
				visible: 'hide',
				status: 'activated',
				appId: await divineIntNumber(8),
				iv: await divineIntStringer(32),
				appSecret: await divineIntStringer(64),
				customer: data
			})
			return await divineResult({ message: '创建成功' })
		})
	}
}
