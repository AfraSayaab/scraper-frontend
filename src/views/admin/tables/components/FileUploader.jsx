import React, { useEffect, useState } from "react";
import { Card, Button, Table, Upload, Progress, Typography, Space, message } from "antd";
import { UploadOutlined, DownloadOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined, PlayCircleTwoTone } from "@ant-design/icons";
import {
  useStartScrapingMutation,
  useStopScrapingMutation,
  useFetchFileDetailsQuery,
  useDeleteFileMutation,
  useUploadFileMutation,
  useFetchRunningFileQuery,
  useDownloadFileMutation,
  useStartScrapingAllMutation,
  useStopScrapingAllMutation,
} from "../../../../features/scraper/scraperSlice";
import { splitExcelFile } from "./FileSplitter";
const { Title, Text } = Typography;

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [runningFile, setRunningFile] = useState(null); // Stores the name of the file currently being appended
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isScrapingAll, setIsScrapingAll] = useState(false); // Indicates if all files are being scraped

  const [runningFiles, setRunningFiles] = useState([]); // Track all running files individually

  const [pollingInterval, setPollingInterval] = useState(null); // For live updates

  const { data = {}, refetch: refetchFileDetails } = useFetchFileDetailsQuery({ page: pagination.current, limit: pagination.pageSize });
  const fileDetails = data.fileDetails || [];
  const totalFiles = data.total || 0;
  const { data: currentRunningFile } = useFetchRunningFileQuery();
  const [startScraping] = useStartScrapingMutation();
  const [stopScraping] = useStopScrapingMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [uploadFile] = useUploadFileMutation();
  const [downloadFile] = useDownloadFileMutation();
  const [startScrapingAll] = useStartScrapingAllMutation();
  const [stopScrapingAll] = useStopScrapingAllMutation();

  const MAX_RUNNING_FILES = 20; // Set the limit of simultaneous files

  useEffect(() => {
    if (currentRunningFile && Array.isArray(currentRunningFile.runningFiles)) {
      setRunningFiles(currentRunningFile.runningFiles.map(file => file.fileName)); // Set all running files at once
    }
  }, [currentRunningFile]);

  useEffect(() => {
    if (data && typeof refetchFileDetails === "function") {
      refetchFileDetails();
    }
  }, [pagination.current, pagination.pageSize, runningFile]);


  useEffect(() => {
    if (runningFiles && typeof refetchFileDetails === "function") {
      // Start polling for file details every 10 seconds when scraping is active
      const interval = setInterval(() => {
        refetchFileDetails(); // Fetch latest data
      }, 10000); // Poll every 10 seconds

      setPollingInterval(interval); // Store interval ID for later clearing
    } else if (pollingInterval) {
      // Clear the interval if scraping has stopped
      clearInterval(pollingInterval);
      setPollingInterval(null); // Reset interval ID
    }

    // Clean up interval when component unmounts or runningFile changes
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [runningFiles]);



  const handleFileChange = (info) => {
    if (info.file.status !== 'uploading') {
      setFiles(info.fileList.map(file => ({
        ...file,
        uid: file.uid || file.name, // Ensure each file has a unique uid, use `file.name` if `file.uid` is not present
        originFileObj: file.originFileObj,
      })));
    }
  };


  const handleDeleteFile = async (file) => {
    try {
      const response = await deleteFile({ fileName: file.fileName }).unwrap();
      if (response.status === "1") {
        message.success("File deleted successfully.");
        refetchFileDetails();
      } else {
        message.error("Failed to delete file: " + response.message);
      }
    } catch (error) {
      console.error("Error deleting file:", error.message);
      message.error("Error deleting file. Please try again.");
    }
  };

  // const handleUploadFile = async (file) => {
  //   const formData = new FormData();
  //   formData.append("data_file", file);

  //   try {
  //     const response = await uploadFile(formData).unwrap();
  //     console.log("File uploaded:", response);
  //     refetchFileDetails();
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     message.error("Error uploading file. Please try again.");
  //   }
  // };

  const handleUploadFile = async (file) => {
    try {
      const splitFiles = await splitExcelFile(file.originFileObj);
      for (const splitFile of splitFiles) {
        const formData = new FormData();
        formData.append("data_file", splitFile);
        await uploadFile(formData).unwrap();
      }
      message.success("File uploaded successfully.");
      refetchFileDetails();
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Error uploading file. Please try again.");
    }
  };



  // const handleUploadAllFiles = async () => {
  //   try {
  //     await Promise.all(files.map(file => handleUploadFile(file.originFileObj)));
  //     message.success("All files uploaded successfully.");
  //     setFiles([]); // Clear selected files after successful upload
  //   } catch (error) {
  //     message.error("Error occurred while uploading files. Please try again.");
  //   }
  // };

  const handleUploadAllFiles = async () => {
    try {
      for (const file of files) {
        await handleUploadFile(file);
      }
      message.success("All files uploaded successfully.");
      setFiles([]); // Clear selected files after successful upload
    } catch (error) {
      message.error("Error occurred while uploading files. Please try again.");
    }
  };


  const handleStartScraping = async (file) => {
    if (runningFiles.includes(file.fileName)) {
      message.warning(`File ${file.fileName} is already being appended.`);
      return;
    }
  
    // Check if we have already reached the limit of 5 files
    if (runningFiles.length >= MAX_RUNNING_FILES) {
      message.warning("Maximum limit of 5 files running at a time has been reached.");
      return;
    }
  
    // Optimistically add the file to the list of running files
    setRunningFiles((prevRunningFiles) => [...prevRunningFiles, file.fileName]);
  
    try {
      const response = await startScraping({ fileName: file.fileName }).unwrap();
      console.log(response);
      message.success(`Scraping started successfully for ${file.fileName}`);
      refetchFileDetails(); // Refetch to ensure data is correct
    } catch (error) {
      // Remove the file from runningFiles if there's an error
      setRunningFiles((prevRunningFiles) =>
        prevRunningFiles.filter((runningFile) => runningFile !== file.fileName)
      );
      const errorMessage = error.response ? error.response.data.message : error.message;
      message.error(errorMessage);
    }
  };




  const handleStopScraping = async (file) => {
    if (!runningFiles.includes(file.fileName)) {
      message.warning(`File ${file.fileName} is not currently running.`);
      return;
    }

    try {
      const response = await stopScraping({ fileName: file.fileName }).unwrap();
      message.success(response.message);
      setRunningFiles((prevRunningFiles) =>
        prevRunningFiles.filter((runningFile) => runningFile !== file.fileName)
      ); // Remove from runningFiles
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : error.message;
      message.error(errorMessage);
    }
  };



  const handleStartScrapingAll = async () => {
    // Check if there are any files available for scraping
    if (fileDetails.length === 0) {
      message.warning("No files available for scraping.");
      return;
    }
  
    // Filter files that are not already running, then limit to remaining available slots
    const filesToStart = fileDetails
      .filter((file) => !runningFiles.includes(file.fileName)) // Exclude already running files
      .slice(0, MAX_RUNNING_FILES - runningFiles.length); // Limit to remaining available slots
  
    // Check if there are any available slots for new files to start
    if (filesToStart.length === 0) {
      message.warning("Maximum of 5 files are already running. Stop a file to start a new one.");
      return;
    }
  
    // Optimistically add these files to runningFiles and mark scraping as active
    setRunningFiles((prevRunningFiles) => [
      ...prevRunningFiles,
      ...filesToStart.map((file) => file.fileName),
    ]);
    console.log(isScrapingAll)
    setIsScrapingAll(true);
  
    try {
      const payload = {
        fileNames: filesToStart.map((file) => file.fileName),
      };
      const response = await startScrapingAll(payload).unwrap();
      console.log(response);
      message.success("Scraping started for selected files successfully.");
      refetchFileDetails();
    } catch (error) {
      // Rollback in case of error
      setRunningFiles((prevRunningFiles) =>
        prevRunningFiles.filter(
          (fileName) => !filesToStart.map((file) => file.fileName).includes(fileName)
        )
      );
      setIsScrapingAll(false);
      const errorMessage = error?.data?.message || error.message;
      message.error(errorMessage);
    }
  };


  const handleStopScrapingAll = async () => {
    // Optimistically update the runningFile state to indicate no files are running
    setRunningFile(null);
    setRunningFiles([]);
    setIsScrapingAll(false);

    try {
      const fileNames = fileDetails.map((file) => file.fileName);
      const response = await stopScrapingAll({ fileNames }).unwrap();
      if (response && response.status === "200") {
        message.success(response.message);
      } else {
        message.warning("Failed to stop scraping for all files, please try again.");
        setRunningFiles(fileDetails.map((file) => file.fileName));
        setIsScrapingAll(true);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Unknown error occurred while stopping all scrapers.";
      message.error(errorMessage);
      setRunningFiles(fileDetails.map((file) => file.fileName));
      setIsScrapingAll(true);
    }
  };




  // const handleDownloadFile = async (file) => {
  //   try {
  //     const response = await downloadFile({ fileName: file.fileName }).unwrap();
  //     const url = window.URL.createObjectURL(new Blob([response]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", file.fileName);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     message.success("Download initiated. Please check your browser's download folder.");
  //   } catch (error) {
  //     const errorMessage = error.response
  //       ? error.response.data.message
  //       : error.message;
  //     console.error("Error downloading:", errorMessage);
  //     message.error(errorMessage);
  //   }
  // };

  const handleDownloadFile = async (file) => {
    try {
        // Request the file from the backend
        const response = await downloadFile({ fileName: file.fileName }).unwrap();

        // Create a Blob for the CSV data
        const blob = new Blob([response], { type: "text/csv" });

        // Generate a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Modify the filename to ensure .xlsx is replaced with .csv
        const csvFileName = file.fileName.replace(/\.xlsx$/, ".csv");

        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = url;

        // Set the filename with the .csv extension
        link.setAttribute("download", csvFileName);

        // Append the anchor to the DOM, trigger the download, and remove it
        document.body.appendChild(link);
        link.click();
        link.remove();

        message.success(
            "Download initiated. Please check your browser's download folder."
        );
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data.message
            : error.message;
        console.error("Error downloading:", errorMessage);
        message.error(errorMessage);
    }
};

  



  const handleTableChange = (pagination) => {
    setPagination({ current: pagination.current, pageSize: pagination.pageSize });
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Total Rows",
      dataIndex: "totalRows",
      key: "totalRows",
    },
    {
      title: "Appended Rows",
      dataIndex: "scrapedRows",
      key: "scrapedRows",
    },
    {
      title: "Appended Percentage",
      dataIndex: "scrapedPercentage",
      key: "scrapedPercentage",
      render: (percentage) => <Progress percent={parseFloat(percentage)} />,
    },
    {
      title: "Status",
      key: "status",
      render: (_, file) => (
        runningFiles.includes(file.fileName) ? (
          <Text type="success">Running</Text>
        ) : (
          <Text type="danger">Stopped</Text>
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, file) => (
        <Space size="middle">
          {runningFiles.includes(file.fileName) ? (
            <Button
              icon={<StopOutlined />}
              type="primary"
              onClick={() => handleStopScraping(file)}>
              Stop
            </Button>
          ) : (
            <Button
              icon={<PlayCircleOutlined />}
              type="primary"
              onClick={() => handleStartScraping(file)}
            //disabled={runningFile && runningFile !== file.fileName}
            >
              Start
            </Button>
          )}
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadFile(file)}
          >
            Download
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteFile(file)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ width: "100%" }}>
      <Title level={2} style={{ color: "#1d3557" }}>Upload a File</Title>
      <Upload
        multiple
        beforeUpload={() => false}
        onChange={handleFileChange}
        fileList={files}
        customRequest={({ file, onSuccess }) => {
          handleUploadFile(file);
          setTimeout(() => onSuccess("ok"), 0);
        }}
        listType="picture"
      >
        <Button icon={<UploadOutlined />}>Select Files</Button>
      </Upload>
      <Space style={{ marginTop: 20 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUploadAllFiles}
        >
          Upload Files
        </Button>

        <Button
          color="primary"
          variant="solid"
          icon={<PlayCircleTwoTone />}
          onClick={handleStartScrapingAll}
          disabled={runningFile !== null}
        >
          Start Scraping All
        </Button>

        <Button
          color="danger"
          variant="outlined"
          icon={<StopOutlined />}
          onClick={handleStopScrapingAll}
        >
          Stop Scraping All
        </Button>
      </Space>

      <div style={{ marginTop: 20 }}>
        <Title level={4}>Current Status</Title>
        {runningFiles.length > 0 ? (
          <ul style={{ paddingLeft: '20px' }}>
            {runningFiles.map((fileName) => (
              <li key={fileName}>
                <Text type="success">{fileName}</Text>
              </li>
            ))}
          </ul>
        ) : (
          <Text type="danger">No files are currently being appended.</Text>
        )}
      </div>





      <Title level={4} style={{ marginTop: 30 }}>File Details</Title>
      <Table
        columns={columns}
        dataSource={Array.isArray(fileDetails) ? fileDetails : []}
        rowKey={(record) => record.fileName}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalFiles,
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        style={{ marginTop: 20 }}
        bordered={true}
      />
    </Card>
  );
};

export default FileUploader;
