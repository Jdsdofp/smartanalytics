import Layout from "../../components/layout/Layout";

export default function NotFound() {
    return (
        <Layout showEmbedButton={false} showFavoriteButton={false}>
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
        </Layout>
    );
}