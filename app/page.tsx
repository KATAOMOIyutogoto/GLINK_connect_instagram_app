import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Instagram OAuth 連携
          </h1>
          <p className="text-lg mb-8 text-gray-600">
            Instagram プロアカウントを接続して、社内Botからアクセスできるようにします
          </p>

          <div className="flex flex-col gap-4 items-center">
            <Link
              href="/connect"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
              Instagram を接続
            </Link>

            <Link
              href="/connected"
              className="text-blue-600 hover:underline"
            >
              接続済みアカウント一覧を見る
            </Link>
          </div>

          <div className="mt-12 text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">使い方</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>「Instagram を接続」ボタンをクリック</li>
              <li>Instagram（Meta）のOAuth画面で認証・同意</li>
              <li>コールバック後、トークンが暗号化されて保存されます</li>
              <li>接続済みアカウント一覧で状態を確認できます</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
