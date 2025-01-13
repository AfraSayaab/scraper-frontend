// Old Files to start handle scraping

const handleStartScraping = async (file) => {
    if (runningFiles.includes(file.fileName)) {
      message.warning(`File ${file.fileName} is already being appended.`);
      return;
    }

    // Optimistically add the file to the list of running files
    setRunningFiles((prevRunningFiles) => [...prevRunningFiles, file.fileName]);

    try {
      const response = await startScraping({ fileName: file.fileName }).unwrap();
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


  const handleStartScrapingAll = async () => {
    if (fileDetails.length === 0) {
      message.warning("No files available for scraping.");
      return;
    }

    // Optimistically update the runningFile state to indicate all files are running
    setRunningFile("all files");
    setRunningFiles(fileDetails.map((file) => file.fileName));
    setIsScrapingAll(true);

    try {
      const payload = {
        fileNames: fileDetails.map((file) => file.fileName),
      };
      const response = await startScrapingAll(payload).unwrap();
      message.success("Scraping started for all files successfully.");
      refetchFileDetails();
    } catch (error) {
      setRunningFile(null); // Revert if there's an error
      setRunningFiles([]);
      setIsScrapingAll(false);
      const errorMessage = error?.data?.message || error.message;
      message.error(errorMessage);
    }
  };