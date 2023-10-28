import { Controller, Post, Get, Query, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { AppwrService } from '@captchar/appwr/appwr.service'
import { NoticeResolver } from '@/interface/common.resolver'
import { CreateAppwr } from '@captchar/interface/appwr.resolver'

@ApiTags('验证码应用模块')
@Controller('appwr')
export class AppwrController {
	constructor(private readonly appwrService: AppwrService) {}

	@Post('/create')
	@ApiDecorator({
		operation: { summary: '创建应用' },
		response: { status: 200, description: 'OK', type: NoticeResolver },
		authorize: { login: true, error: true }
	})
	public async httpCreateAppwr(@Request() request, @Body() body: CreateAppwr) {
		return await this.appwrService.httpCreateAppwr(body, request.user.uid)
	}
}
