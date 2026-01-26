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
            Instagram ビジネス/クリエイターアカウントを接続して、<br />
            後続のBotが投稿・ストーリーをダウンロードできるようにします
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
              <li>コールバック後、アクセストークンが暗号化されて保存されます</li>
              <li>接続済みアカウント一覧で状態を確認できます</li>
              <li>後続のBotが <code className="bg-gray-100 px-1 rounded">/api/instagram/token</code> からトークンを取得して使用します</li>
            </ol>
            
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800 mb-2">✨ 簡単になりました:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                <li>ビジネス/クリエイターアカウントのみ対応（個人アカウントは不可）</li>
                <li className="font-semibold">FacebookアカウントやFacebookページへの接続は不要です</li>
                <li>Instagramアカウントだけでログインできます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
