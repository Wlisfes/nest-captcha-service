import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common'
import { CustomService } from '@/service/custom.service'
import { CacheCustomer } from '@/cache/cache-customer.service'
import { DataBaseService } from '@/service/database.service'
import { OSS_CLIENT, OSS_STS_CLIENT } from '@common/aliyun/aliyun.provider'
import { moment, divineCatchWherer, divineBufferToStream } from '@/utils/utils-plugin'
import { divineIntNumber, divineResult } from '@/utils/utils-common'
import { custom } from '@/utils/utils-configer'
import * as Client from 'ali-oss'

@Injectable()
export class AliyunService extends CustomService {
	constructor(
		private readonly cacheCustomer: CacheCustomer,
		private readonly dataBase: DataBaseService,
		@Inject(OSS_CLIENT) protected readonly client: Client,
		@Inject(OSS_STS_CLIENT) protected readonly stsClient: Client.STS
	) {
		super()
	}

	/**文件流转换**/
	public async createStream(file, pathFolder = 'static') {
		const fieldName = file.originalname
		const suffix = fieldName.slice(fieldName.lastIndexOf('.') + 1).toLowerCase()
		const fileId = await divineIntNumber()
		const fileName = [fileId, suffix].join('.')
		const folder = ['basic', pathFolder, moment().format('YYYY-MM'), fileName].join('/')
		return { fileId, fileName, folder, fieldName, suffix, fileStream: await divineBufferToStream(file.buffer) }
	}

	/**删除文件**/
	public async deleteFiler(path: string) {
		return await this.client.delete(path)
	}

	/**创建OSS临时授权**/
	public async httpCreateStorageAuthorize(uid: string) {
		try {
			const rolearn = custom.aliyun.oss.rolearn
			const sessionname = custom.aliyun.oss.sessionname
			const result = await this.stsClient.assumeRole(rolearn, '', 7200, sessionname)
			await divineCatchWherer(result.res.statusCode !== HttpStatus.OK, {
				message: '授权失败',
				code: HttpStatus.NOT_IMPLEMENTED
			})
			return await divineResult({
				interval: 7000,
				endpoint: custom.aliyun.oss.endpoint,
				bucket: custom.aliyun.oss.bucket,
				region: custom.aliyun.oss.region,
				accessKeyId: result.credentials.AccessKeyId,
				accessKeySecret: result.credentials.AccessKeySecret,
				token: result.credentials.SecurityToken,
				expire: moment(result.credentials.Expiration).format('YYYY-MM-DD HH:mm:ss')
			})
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
		}
	}
}
