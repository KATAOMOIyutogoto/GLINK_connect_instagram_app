'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleConnect = async () => {
    // OAuth開始のAPIを呼び出す（リダイレクトされる）
    window.location.href = '/api/instagram/login';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">
            Instagram アカウントを接続
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">エラーが発生しました</p>
              <p className="text-sm">{decodeURIComponent(error)}</p>
            </div>
          )}

          <div className="mb-8 text-gray-600">
            <p className="mb-4">
              このボタンをクリックすると、Instagram（Meta）の認証画面に遷移します。
            </p>
            <p className="text-sm">
              ※ Instagram プロアカウントまたはビジネスアカウントが必要です
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity mb-6"
          >
            Instagram で認証
          </button>

          <div className="mt-8">
            <Link href="/" className="text-blue-600 hover:underline">
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">読み込み中...</div>}>
      <ConnectContent />
    </Suspense>
  );
}
