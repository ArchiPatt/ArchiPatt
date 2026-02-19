import {apiBuilder} from "./api/apiBuilder.ts";
import {MainPage} from "./pages/MainPage";
import {MantineProvider} from "@mantine/core";
import {Header} from "./widgets/Header";

function App() {

  return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
       <Header/>
      </MantineProvider>
  )
}

export default App
