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
                    <title>Discord | Your Place to Talk and to Hang Out</title>
                    <link rel='icon' href='/images/favicon.svg' />
                </Head>
                {getLayout(<Component {...pageProps} key={router.asPath} />)}
                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App;
