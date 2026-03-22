import st from "./NotFoundPage.module.scss"
import {Button, Flex, Text} from "@mantine/core";
import {Link} from "react-router-dom";
import {LINK_PATHS} from "../../../../shared/constants/LINK_PATHS.ts";

const NotFoundPage = () => {

    return (
        <Flex
            className={st.root}
            align={"center"}
            justify={"center"}
            flex={'column'}
        >
            <Text
                size="xl"
                fw={700}
            >
                Not found.
            </Text>
            <Link to={LINK_PATHS.MAIN}>
                <Button
                    variant="subtle"
                >
                    На главную
                </Button>
            </Link>
        </Flex>
    )
}

export { NotFoundPage }