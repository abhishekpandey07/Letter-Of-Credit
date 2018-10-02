import React, {Component} from  'react'
import XLSX from 'xlsx'
import FileDownload from '@material-ui/icons/FileDownload'
import Button from '@material-ui/core/Button'
import XlsxPopulate from 'xlsx-populate'
/*
	Accepts an aoa for Summary, Payment Cycles, Extension Cycles, other info.
	paymentCycleTale: getElementById('paymentTable') # payElem
	extensionCycleTable: getElementById('extensionTable') # extElem
*/

function SummaryDownloadButton(props){

	var disable = false
	if( !props.extData ||
		!props.payData ||
		!props.LC){
		disable=true
	} 
	
	var downloadWorkBook = (props) => (event,target) => {
		const { LC } = props;
		
		var extChargeHeads = [0,0,0,0]
		var payChargeHeads = [0,0,0,0,0]
		var amount = parseFloat(LC.amount)
		var totalCharges = props.totalExtensionCharges + props.totalPaymentCharges
		var loss = ((props.UnUtilized/amount)*totalCharges).toFixed(2)
		var clearedAMT = parseFloat(LC.m_cl_amt)

		const extensionData = props.extData.map((prop,key) => {
			var row =  prop.filter((p,k) => {
				return k != prop.length-1
			})

			var details = LC.dates[key];
			var addData = []
			addData.push(parseFloat(details.open? details.open : 0));
			addData.push(parseFloat(details.amend? details.amend: 0));
			addData.push(parseFloat(details.GST));
			addData.push(parseFloat(details.post));
			extChargeHeads = addData.map((val,key) => {
				return val + extChargeHeads[key]
			})
			row.splice(-1,0,...addData);
			row.splice(0,0,key+1)

			return row
		})
		const paymentData = props.payData.slice(0,props.payData.length-1).map((prop,key) => {
			// removing the Icons
			var row =  prop.filter((p,k) => {
				return k != prop.length-1
			})

			//
			row = row.map((prop,key) => {
				if( prop.includes(',') ) {
					const val = prop.split(',').join('')
					if(!isNaN(val)) {
						return parseFloat(val)
					}
				}	

				return prop
					
			})
			var cycles = LC.payment.cycles[key];
			var addData = []
			
			addData.push(parseFloat(cycles.acc.acc))
			addData.push(parseFloat(cycles.acc.GST))

			if(cycles.payed){
				addData.push(parseFloat(cycles.pay.bill_com))
				addData.push(parseFloat(cycles.pay.GST))
				addData.push(parseFloat(cycles.pay.post))
				
			} else {
				addData.push('N/A')
				addData.push('N/A')
				addData.push('N/A')
			}

			row.splice(-1,0,...addData);
			// code below didn't work since did not cover everything. or did it ?
			payChargeHeads = addData.map((val,key) => {
				if(!isNaN(val)) {
					return val + payChargeHeads[key]
				}
				else{
					return payChargeHeads[key]
				}
			})

			row.splice(0,0,key+1)
			
			return row
		})

		
		var headersLine = [[`Letter Of Credit : ${LC.LC_no} summary`,'','','','','','','','',''],
							['','Issuer','','Supplier','','LC No.','FDR No.','Amount','Margin Amt'],
							['','Name','Branch','Name','Location'],
							['',LC.issuer.name,LC.issuer.branch,LC.supplier.name,LC.supplier.city,LC.LC_no,LC.FDR_no ? LC.FDR_no:'-',
							parseFloat(LC.amount),parseFloat(LC.m_amt)]]
		
		XlsxPopulate.fromBlankAsync()
		.then(workBook => {
			var sheet = workBook.addSheet('Summary')
			// writing LC Details
			var cells = sheet.cell("B2").value(headersLine)

			//generating payment details
			paymentData.push(['','Total',parseFloat(LC.payment.total_due),'Total'].concat(payChargeHeads).concat(props.totalPaymentCharges))
			var payAddHeaders = ['Acceptance','','Payment','','']
			props.payHead.splice(-1,0,...payAddHeaders)
			props.payHead.splice(0,0,'Sno');
			var data = [['Payment Cycles','','','','','','','','','','','','','',''],
							  props.payHead,
							  ['','','','','Acc. Charge','GST','Bill Comm.','GST','Post'],...paymentData]
			
			//writing payment details
			cells = sheet.cell("B7").value(data)
			
			// generating expiration Details
			props.extHead.splice(-1,0,...['Opening Ch.','Amend. Ch.','GST','Post'])
			props.extHead.splice(0,0,'Sno')
			var extData = [['Processing Cycles','','','','','','','','','','','','',''],props.extHead,...extensionData]

			//writing extension Data
			
			var extRow = 9 +  props.payData.length + 2
			cells = sheet.cell(`B${extRow}`).value(extData)

			// writing Charges and Margin
			var data = [
				['Charges and Margin Summary','','','','',''],
				['Processing Charges',props.totalExtensionCharges,'Unutilized Amount',props.UnUtilized,
				 'Margin Cl. Dt',LC.m_cl_DT ? LC.m_cl_DT :'-'],
				['Payment Charges', props.totalPaymentCharges,'Loss',loss,'Cleared Amount',clearedAMT],
				['Total Charges',totalCharges,'Interest',(amount-clearedAMT)]
			]

			var chargesRow = extRow+2+extensionData.length+2
			cells = sheet.cell(`D${chargesRow}`).value(data)


			function getStyle(border, horizontalAlignment=null, wrapText=true, verticalAlignment='center'){
				return({
					border: {
					left: border,
					right: border,
					bottom: border,
					top: border
				},
				verticalAlignment: verticalAlignment,				
				horizontalAlignment: horizontalAlignment,
				wrapText:wrapText
					});

			}


			var mergeList = ["B2:K2","C3:D3","E3:F3","G3:G4","H3:H4","I3:I4","J3:J4",
							 "B7:K7","B8:B9","C8:C9","D8:D9","E8:E9","F8:G8","H8:J8","K8:K9",
							 `B${extRow}:K${extRow}`,`D${chargesRow}:I${chargesRow}`]

			mergeList.map((m,idx) => {
				var cells = sheet.range(m)
				cells = cells.merged(true)
				cells.style(getStyle('thin','center'))
				return
			});

			//summary
			sheet.range("B4:K5").style(getStyle('thin'))
			//payment
			sheet.range(`B9:K${paymentData.length+10}`).style(getStyle('thin','null',false))
			//extension
			sheet.range(`B${extRow+2-1}:K${extRow+1+extensionData.length}`).style(getStyle('thin','null',false))
			//charges and margins
			sheet.range(`D${chargesRow+1}:I${chargesRow+3}`).style(getStyle('thin','null',false))
		





			// output
			var a = document.createElement('a')
			workBook.outputAsync("base64")
			.then(function (base64) {
				a.href = "data:" + XlsxPopulate.MIME_TYPE + ";base64," + base64;
				a.target='_blank'
				a.download=`${LC.LC_no}.xlsx`
				a.click()

			});
			//return workBook.toFileAsync("./out.xlsx");
		})							
		/*var workBook = XLSX.utils.book_new()
		var row = 1
		var col = 1
		var summarySheet = XLSX.utils.aoa_to_sheet(headersLine,{origin:{r:row,c:col}})
		
		var merges = []
		merges.push({s:{c:col,r:row},e:{c:col+8,r:row}}); // Title
		merges.push({s:{c:col,r:row+1},e:{c:col+1,r:row+1}}); // Issuer
		merges.push({s:{c:col+2,r:row+1},e:{c:col+3,r:row+1}}); //Supplier
		
		[...Array(4).keys()].map((prop,key) => { // Rest Heads
			var c = prop+5
			merges.push({s:{c:c,r:row+1},e:{c:c,r:row+2}})
		})

		row += headersLine.length + 1

		// Add Payment Table
		
		var offset = headerData.length
		XLSX.utils.sheet_add_aoa(summarySheet,headerData,{origin: {r:row,c:col}});
		if(paymentData.length > 0){
			console.log(paymentData)
			XLSX.utils.sheet_add_aoa(summarySheet,paymentData,{origin: {r:row+offset,c:col}});	
		}
		
		
		merges.push({s:{r:row,c:col},e:{r:row,c:col+props.payHead.length-1}}) // Payment Cycles
		merges.push({s:{r:row+1,c:col+4},e:{r:row+1,c:col+5}}); // payment acceptance
		merges.push({s:{r:row+1,c:col+6},e:{r:row+1,c:col+8}}); // payment payment dets.
		var _ = [...Array(4).keys()].concat([props.payHead.length-1]).map((prop,key) => {
			merges.push({s:{r:row+1,c:col+prop},e:{r:row+2,c:col+prop}})	
			return
		})
		
		row += paymentData.length + offset +1
		// Add Processing Data (extension data)
		props.extHead.splice(-1,0,...['Opening Ch.','Amend. Ch.','GST','Post'])
		props.extHead.splice(0,0,'Sno')
		var headerData = [['Processing Cycles'],props.extHead]
		
		
		var offset1 = headerData.length
		XLSX.utils.sheet_add_aoa(summarySheet,headerData,{origin: {r:row,c:col}});
		if(extensionData.length > 0){
			XLSX.utils.sheet_add_aoa(summarySheet,extensionData,{origin: {r:row+offset1,c:col}});
		}
		
		
		merges.push({s:{r:row,c:col},e:{r:row,c:col+props.extHead.length-1}}) //extension cycles

		// Charges and Margin Summary
		row += offset > offset1 ? offset + paymentData.length + 1 : offset1 + extensionData.length + 1;
		console.log(row)
		
		var data = [
			['Charges and Margin Summary'],
			['Processing Charges',props.totalExtensionCharges,'Unutilized Amount',props.UnUtilized,
			 'Margin Cl. Dt',LC.m_cl_DT ? LC.m_cl_DT :'-'],
			['Payment Charges', props.totalPaymentCharges,'Loss',loss,'Cleared Amount',clearedAMT],
			['Total Charges',totalCharges,'Interest',(amount-clearedAMT)]

		]
		XLSX.utils.sheet_add_aoa(summarySheet,data,{origin:{r:row,c:col+3}})
		merges.push({s:{r:row,c:col+3},e:{r:row,c:col+8}})

		summarySheet['!merges'] = merges
		XLSX.utils.book_append_sheet(workBook,summarySheet,'SummarySheet');
	 	
	 	XLSX.writeFile(workBook,String(LC.LC_no)+'.xlsx');*/
	}

	return (
			<Button disabled={disable} style={{margin:'auto'}}variant='contained' size='mini'
				onClick={downloadWorkBook(props)}>
				<FileDownload/> Download
			</Button>
	);
}

// export default
/**/
export default SummaryDownloadButton