import * as XLSX from 'xlsx';

/**
 * XLSX logic
 */
// export async function splitExcelFile(inputFile, maxSizeMB = 1, maxRows = 10000) {
//   const fileData = await inputFile.arrayBuffer();
//   const workbook = XLSX.read(fileData, { type: 'array' });
//   const sheetNames = workbook.SheetNames;
//   const maxSizeBytes = maxSizeMB * 1024 * 1024;
//   let currentPart = 1;
//   let currentWorkbook = XLSX.utils.book_new();
//   let currentSize = 0;
//   let parts = [];
  
//   // Clean up the original file name for use in output files
//   const originalFileName = inputFile.name.replace(/.xlsx$/, '').replace(/\s+/g, '_');

//   for (let i = 0; i < sheetNames.length; i++) {
//     const sheetName = sheetNames[i];
//     const sheet = workbook.Sheets[sheetName];
//     const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//     // Split the sheet data into chunks of maxRows
//     for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex += maxRows) {
//       const chunkData = sheetData.slice(rowIndex, rowIndex + maxRows);
//       const chunkSheet = XLSX.utils.aoa_to_sheet(chunkData);

//       // Create a temporary workbook with this chunk to calculate its size
//       let tempWorkbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(tempWorkbook, chunkSheet, `${sheetName}_part_${Math.ceil((rowIndex + 1) / maxRows)}`);
//       const tempArrayBuffer = XLSX.write(tempWorkbook, { bookType: 'xlsx', type: 'array' });
//       const chunkSize = new Blob([tempArrayBuffer]).size;

//       // If adding this chunk exceeds the max size, save current workbook and start a new one
//       if (currentSize + chunkSize > maxSizeBytes) {
//         if (currentWorkbook.SheetNames.length > 0) {
//           const outputArrayBuffer = XLSX.write(currentWorkbook, { bookType: 'xlsx', type: 'array' });
//           const outputBlob = new Blob([outputArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//           parts.push(new File([outputBlob], `${originalFileName}_sheet_part_${currentPart}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
//         }
//         currentWorkbook = XLSX.utils.book_new();
//         currentSize = 0;
//         currentPart++;
//       }

//       // Append chunk to current workbook
//       XLSX.utils.book_append_sheet(currentWorkbook, chunkSheet, `${sheetName}_part_${Math.ceil((rowIndex + 1) / maxRows)}`);
//       currentSize += chunkSize;
//     }
//   }

//   // Save the remaining workbook if it has any sheets
//   if (currentWorkbook.SheetNames.length > 0) {
//     const outputArrayBuffer = XLSX.write(currentWorkbook, { bookType: 'xlsx', type: 'array' });
//     const outputBlob = new Blob([outputArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//     parts.push(new File([outputBlob], `${originalFileName}_sheet_part_${currentPart}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
//   }

//   return parts;
// }


/**
 * CSV logic 
 */

export async function splitExcelFile(inputFile, maxSizeMB = 1, maxRows = 10000) {
  const fileData = await inputFile.arrayBuffer();
  const workbook = XLSX.read(fileData, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  let currentPart = 1;
  let currentSize = 0;
  let parts = [];

  // Clean up the original file name for use in output files
  const originalFileName = inputFile.name.replace(/\.xlsx$/, '').replace(/\s+/g, '_');

  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Split the sheet data into chunks of maxRows
    for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex += maxRows) {
      const chunkData = sheetData.slice(rowIndex, rowIndex + maxRows);
      const chunkSheet = XLSX.utils.aoa_to_sheet(chunkData);

      // Convert the chunk to CSV format
      const csvContent = XLSX.utils.sheet_to_csv(chunkSheet);
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const csvSize = csvBlob.size;

      // If adding this chunk exceeds the max size, save it as a new part
      if (currentSize + csvSize > maxSizeBytes) {
        currentSize = 0;
        currentPart++;
      }

      // Save the chunk as a CSV file
      parts.push(new File([csvBlob], `${originalFileName}_sheet_part_${currentPart}.csv`, { type: 'text/csv' }));
      currentSize += csvSize;
    }
  }

  return parts;
}



