import st from "./NotFoundPage.module.scss"
import { Flex, Text } from "@mantine/core";

const NotFoundPage = () => {

    return (
        <Flex
            className={st.root}
            align={"center"}
            justify={"center"}
        >
            <Text
                size="xl"
                fw={700}
            >
                Not found.
            </Text>
        </Flex>
    )
}

export { NotFoundPage }