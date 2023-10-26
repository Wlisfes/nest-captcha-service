import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { Request } from '@/interface/common.interface'

export class OSSUploadFile {
	@ApiProperty({ type: 'string', format: 'binary' })
	@IsNotEmpty({ message: 'file文件不能为空' })
	file: any
}

export class OSSUploadFiles {
	@ApiProperty({ type: 'string', format: 'binary' })
	@IsNotEmpty({ message: 'files文件不能为空' })
	files: any
}

export class OSSResultExcelFile extends PickType(Request, ['id', 'createTime', 'updateTime']) {
	@ApiProperty({ description: '文件地址', example: `https://oss.lisfes.cn/basic/excel/2023-09/59186481996726314527.xlsx` })
	fileURL: string

	@ApiProperty({ description: '文件ID', required: false, example: `59186481996726314527` })
	@IsOptional()
	fileId: string

	@ApiProperty({ description: '原始文件名', example: `example-200.xlsx` })
	fieldName: string

	@ApiProperty({ description: '文件重命名', example: `59186481996726314527.xlsx` })
	fileName: string

	@ApiProperty({ description: '文件存储路径', example: `basic/excel/2023-09/59186481996726314527.xlsx` })
	folder: string

	@ApiProperty({ description: '文件后辍', required: false, example: `xlsx` })
	@IsOptional()
	suffix: string

	@ApiProperty({ description: '文件解析列表', example: [] })
	list: []

	@ApiProperty({ description: '文件解析列表总数', example: 200 })
	total: number
}

export class BasicExcelFile {
	@ApiProperty({ description: '文件ID', example: `59186481996726314527` })
	@IsNotEmpty({ message: '文件ID 必填' })
	fileId: string
}

/**excel文件列表**/
export class ColumnExcelFile extends IntersectionType(
	PickType(Request, ['page', 'size']),
	PickType(OSSResultExcelFile, ['fileId', 'suffix'])
) {}