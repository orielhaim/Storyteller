export default function handleRequest(handler) {
  return async (event, ...args) => {
    try {
      const result = await handler(...args);
      return { success: true, data: result };
    } catch (error) {
      console.error('IPC Handler Error:', error);
      return { success: false, error: error.message };
    }
  };
}