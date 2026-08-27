import { useCallback, useState } from "react";

function useApi() {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const execute = useCallback(async (request) => {
    setLoading(true);
    setIsError(false);
    setErrMessage("");
    setIsSuccess(false);
    setSuccessMessage("");

    try {
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          request().then(resolve).catch(reject);
        }, 500);
      });
      setData(response);
      setIsSuccess(true);
      setSuccessMessage(response?.message || "Request completed successfully.");
      return response;
    } catch (error) {
      setData(null);
      setIsError(true);
      setErrMessage(error instanceof Error ? error.message : "Something went wrong.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    isError,
    errMessage,
    data,
    isSuccess,
    successMessage,
    execute,
  };
}

export default useApi;
