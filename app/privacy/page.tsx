export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 収集する情報</h2>
            <p>
              本アプリケーションは、Instagram API連携のために以下の情報を収集します：
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Instagramユーザーアカウント情報（ユーザーID、ユーザー名、アカウントタイプ）</li>
              <li>アクセストークン（暗号化して保存）</li>
              <li>投稿とストーリーのメディアデータ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 情報の利用目的</h2>
            <p>
              収集した情報は、以下の目的でのみ使用されます：
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Instagramアカウントへのアクセス認証</li>
              <li>投稿とストーリーの取得・保存</li>
              <li>サービスの提供と改善</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 情報の保護</h2>
            <p>
              アクセストークンは、AES-256-GCM暗号化アルゴリズムを使用して安全に保存されます。
              お客様の情報は、適切なセキュリティ対策を講じて管理されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 第三者への提供</h2>
            <p>
              お客様の情報を第三者に提供、開示することはありません。
              ただし、法令に基づく場合を除きます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. データの削除</h2>
            <p>
              お客様はいつでもアカウント連携を解除し、保存されたデータの削除を要求することができます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. お問い合わせ</h2>
            <p>
              プライバシーポリシーに関するご質問は、アプリ管理者までお問い合わせください。
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
