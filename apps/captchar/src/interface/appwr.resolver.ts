import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { RequestResolver } from '@/interface/common.resolver'
import { TableCaptcharAppwr } from '@/entity/tb-common.captchar__appwr'

/**创建应用**/
export class CreateAppwr extends PickType(TableCaptcharAppwr, ['name']) {}

/**应用列表**/
export class ColumnAppwr extends PickType(RequestResolver, ['page', 'size']) {}