import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Repository, FindOneOptions, FindConditions, FindManyOptions, DeepPartial } from 'typeorm'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResult } from '@/utils/utils-common'

@Injectable()
export class CustomService {
	/**验证数据模型是否存在**/
	public async validator<T>(model: Repository<T>, state: FindOneOptions<T> & Partial<{ message: string; code: number }>) {
		try {
			const node = await model.findOne(state)
			await divineCatchWherer(!node && !!state.message, {
				message: state.message ?? '服务器开小差了',
				code: state.code ?? (state.message ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR)
			})
			return await divineResult(node)
		} catch (e) {
			throw new HttpException(e.message, e.code)
		}
	}

	/**创建数据模型**/
	public async customeCreate<T>(model: Repository<T>, state: DeepPartial<T>) {
		try {
			const node = await model.create(state)
			return model.save(node as never)
		} catch (e) {
			throw new HttpException('服务器开小差了', HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	public async customeUpdate<T>(model: Repository<T>, criter: FindConditions<T>, state: FindConditions<T>) {
		try {
			return await model.update(criter, state as never)
		} catch (e) {
			console.log(e)
			throw new HttpException('服务器开小差了', HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	/**分页列表查询**/
	public async customeAndCountr<T>(model: Repository<T>, state: FindOneOptions<T> | FindManyOptions<T>) {
		try {
			return await model.findAndCount(state).then(async ([list = [], total = 0]) => {
				return await divineResult({ list, total })
			})
		} catch (e) {
			throw new HttpException(`服务器开小差了`, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}