import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../context/AuthProvider";
import PersistLogin from "../hooks/persistLogin";
import Head from "next/head";
import { useRouter } from "next/router";

const App = ({ Component, pageProps }) => {
    const getLayout = Component.getLayout || ((page) => page);
    const router = useRouter();

    return (
        <AuthProvider>
            <PersistLogin>
                <Head>
                    <title>Unthrust</title>
                    <link rel='icon' href='/assets/favicon.ico' />
                </Head>
                {getLayout(<Component {...pageProps} key={router.asPath} />)}
                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App;
