interface HomePageProps {
    message: string;
  }
  
  function getHomePage(): Promise<HomePageProps> {
      return Promise.resolve({ message: 'Hello' });
  }
  
  export default {
    getHomePage,
  };
  