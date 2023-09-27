import * as dayjs from 'dayjs'
import * as zlib from 'zlib'
import * as Excel from 'exceljs'
export const moment = dayjs

/**字符串压缩**/
export function divineCompress(value: string): Promise<string> {
	return new Promise((resolve, reject) => {
		zlib.deflate(value, (err, buffer) => {
			if (err) {
				console.error('压缩失败:', err)
				reject('压缩失败')
			} else {
				resolve(buffer.toString('base64'))
			}
		})
	})
}

/**字符串解压**/
export function divineUnzipCompr(value: Buffer) {
	return new Promise((resolve, reject) => {
		zlib.inflate(value, (err, buffer) => {
			if (err) {
				console.error('解压失败:', err)
				reject('解压失败')
			} else {
				resolve(buffer.toString())
			}
		})
	})
}

/**解析excel表格文件**/
export function divineParsesheet(buffer: Excel.Buffer) {
	return new Promise(async (resolve, reject) => {
		try {
			const excel = new Excel.Workbook()
			await excel.xlsx.load(buffer)
			const sheet = excel.getWorksheet(1)
			const jsonData = []
			sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
				const rowData = {}

				row.eachCell((cell, colNumber) => {
					console.log({ cell: cell.value, rowNumber, colNumber })
					rowData[`column_${colNumber}`] = cell.value
				})

				jsonData.push(rowData)
			})
			resolve({ total: jsonData.length, list: jsonData })
		} catch (e) {
			reject('文件解析失败')
		}
	})
}
