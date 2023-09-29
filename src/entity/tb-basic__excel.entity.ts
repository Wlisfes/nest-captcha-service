import { Entity, Column, ManyToOne } from 'typeorm'
import { Common } from '@/entity/tb-common'
import { User } from '@/entity/tb-user.entity'

@Entity('tb-basic__excel')
export class tbBasicExcel extends Common {
	@Column({ comment: '文件ID', nullable: false })
	fileId: string

	@Column({ comment: '原始文件名', nullable: false })
	fieldName: string

	@Column({ comment: '文件重命名', nullable: false })
	fileName: string

	@Column({ comment: '文件地址', nullable: false })
	fileURL: string

	@Column({ comment: '文件后辍', nullable: false })
	suffix: string

	@Column({ comment: '文件存储路径', nullable: false })
	folder: string

	@Column({ comment: '文件解析列表总数', nullable: false, default: 0 })
	total: number

	@ManyToOne(type => User)
	user: User
}