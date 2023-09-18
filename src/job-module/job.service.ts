import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { JOB_CAPTCHA_SUPERVISOR } from '@/job-module/job-captcha/job-captcha.config'
import { JOB_MAILER_SCHEDULE } from '@/job-module/job-mailer/job-mailer.config'

@Injectable()
export class JobService {
	constructor(
		@InjectQueue(JOB_CAPTCHA_SUPERVISOR.name) public readonly supervisor: Queue,
		@InjectQueue(JOB_MAILER_SCHEDULE.name) public readonly mailer: Queue
	) {}
}
