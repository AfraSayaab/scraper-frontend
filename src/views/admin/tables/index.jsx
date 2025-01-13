import React from "react";

import FileUploader from "./components/FileUploader"; // Import your FileUploader component

const Tables = () => {
  return (
    <div className="mt-5 grid h-full grid-cols-1 gap-5">
      <FileUploader /> {/* Add FileUploader component here */}
      {/* You can add other table components below if needed */}
      {/* <DevelopmentTable data={tableDataDevelopment} columns={columnsDataDevelopment} />
      <ColumnsTable data={tableDataColumns} columns={columnsDataColumns} />
      <ComplexTable data={tableDataComplex} columns={columnsDataComplex} /> */}
      {/* CheckTable can also be included as needed */}
      {/* <CheckTable data={tableDataCheck} columns={columnsDataCheck} /> */}

     
    </div>
  );
};

export default Tables;
