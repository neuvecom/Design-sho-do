/**
 * バリューコマース広告バナー表示システム（軽量版）
 * クイズ機能なし、複数配置対応（header, sidebar等）
 * affiliates.yamlから読み込み、ローテーション表示
 * 広告ブロッカー検出時はフォールバックバナーを表示
 *
 * @module neuvecom-common/affiliate-lite
 */

(function() {
  'use strict';

  // デフォルト設定
  const DEFAULT_CONFIG = {
    sid: '',
    storageKeyPrefix: 'neuvecom',
    interval: 8000,
    fadeDuration: 500,
    pauseDuration: 30000,
    adCheckDelay: 2500,
    configPath: '/data/affiliates.yaml',
    fallbackImagesPath: '/img/',
    fallbackMessages: [
      { image: 'nc-block01.png', text: 'よかったら広告ブロック外してね？' },
      { image: 'nc-block02.png', text: 'あなたにピッタリの広告だよ！' },
      { image: 'nc-block03.png', text: '見たほうがいいと思うんだけどな…' },
      { image: 'nc-block04.png', text: 'まあ、ブロックしたい気持ちもわかる' },
    ],
  };

  /**
   * 広告バナーマネージャー（軽量版）
   */
  class AffiliateBannerManager {
    /**
     * @param {Object} config - 設定オブジェクト
     * @param {string} config.sid - バリューコマースSID（必須）
     * @param {string} [config.storageKeyPrefix] - localStorageキープレフィックス
     * @param {number} [config.interval] - 自動切替間隔（ミリ秒）
     * @param {string} [config.configPath] - affiliates.yamlのパス
     * @param {Array} [config.fallbackMessages] - フォールバックメッセージ配列
     */
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.adsData = {};  // 配置場所ごとの広告データ
      this.instances = new Map();  // 配置場所ごとのインスタンス状態
      this.isLoaded = false;
      this.loadingPromise = null;  // 読み込み中のPromise

      // ストレージキー
      this.storageKeyBlocked = `${this.config.storageKeyPrefix}-ad-blocked`;
    }

    /**
     * 広告データを読み込む
     */
    async loadAds() {
      // 既に読み込み中の場合は同じPromiseを返す
      if (this.loadingPromise) {
        return this.loadingPromise;
      }

      this.loadingPromise = (async () => {
        try {
          const basePath = this.getBasePath();
          const configPath = this.config.configPath.startsWith('/')
            ? basePath + this.config.configPath.substring(1)
            : basePath + this.config.configPath;

          const response = await fetch(configPath);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const yamlText = await response.text();
          this.adsData = this.parseYaml(yamlText);
          this.isLoaded = true;
          return true;
        } catch (error) {
          console.warn('[neuvecom-common] 広告データの読み込みに失敗:', error);
          return false;
        }
      })();

      return this.loadingPromise;
    }

    /**
     * YAMLパーサー（複数配置対応）
     * header, sidebar, quiz など任意のキーに対応
     */
    parseYaml(text) {
      const result = {};
      const lines = text.split('\n');
      let currentSection = null;
      let currentAd = null;

      for (const line of lines) {
        const trimmed = line.trim();

        // コメントと空行をスキップ
        if (trimmed.startsWith('#') || trimmed === '') {
          continue;
        }

        // セクション開始（header:, sidebar:, quiz: など）
        if (!trimmed.startsWith('-') && trimmed.endsWith(':') && !trimmed.includes(' ')) {
          // 前のセクションの最後のアイテムを保存
          if (currentSection && currentAd) {
            result[currentSection].push(currentAd);
            currentAd = null;
          }

          currentSection = trimmed.slice(0, -1);
          result[currentSection] = [];
          continue;
        }

        if (currentSection) {
          // 新しいアイテム開始
          if (trimmed.startsWith('- pid:')) {
            if (currentAd) {
              result[currentSection].push(currentAd);
            }
            currentAd = {
              pid: parseInt(trimmed.replace('- pid:', '').trim(), 10),
              size: '',
              name: ''
            };
          } else if (currentAd) {
            // プロパティの読み取り
            if (trimmed.startsWith('size:')) {
              currentAd.size = trimmed.replace('size:', '').trim().replace(/"/g, '');
            } else if (trimmed.startsWith('name:')) {
              currentAd.name = trimmed.replace('name:', '').trim().replace(/"/g, '');
            }
          }
        }
      }

      // 最後のアイテムを保存
      if (currentSection && currentAd) {
        result[currentSection].push(currentAd);
      }

      return result;
    }

    /**
     * ベースパスを取得
     */
    getBasePath() {
      // mdBookが設定するpath_to_root変数を確認
      if (typeof path_to_root !== 'undefined' && path_to_root) {
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

        let basePath = currentDir;
        const upDirs = (path_to_root.match(/\.\.\//g) || []).length;

        for (let i = 0; i < upDirs; i++) {
          basePath = basePath.substring(0, basePath.slice(0, -1).lastIndexOf('/') + 1);
        }

        return basePath || '/';
      }

      // フォールバック: URLから推測
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return '/';
      }

      // GitHub Pagesの場合、最初のパスセグメントをリポジトリ名として使用
      const path = window.location.pathname;
      const match = path.match(/^\/([^\/]+)\//);
      if (match) {
        return `/${match[1]}/`;
      }

      return '/';
    }

    /**
     * 広告ブロック状態をlocalStorageから取得
     */
    getBlockedStatus() {
      try {
        return localStorage.getItem(this.storageKeyBlocked) === 'true';
      } catch {
        return false;
      }
    }

    /**
     * 広告ブロック状態をlocalStorageに保存
     */
    setBlockedStatus(blocked) {
      try {
        if (blocked) {
          localStorage.setItem(this.storageKeyBlocked, 'true');
        } else {
          localStorage.removeItem(this.storageKeyBlocked);
        }
      } catch {
        // localStorage使用不可の場合は無視
      }
    }

    /**
     * 広告を描画
     * @param {HTMLElement} container - 描画先コンテナ
     * @param {string} [section='header'] - 広告セクション名（header, sidebar, quiz等）
     */
    render(container, section = 'header') {
      if (!container) {
        return;
      }

      // SIDが設定されていない場合は警告
      if (!this.config.sid) {
        console.warn('[neuvecom-common] SIDが設定されていません');
        return;
      }

      // インスタンス状態を初期化
      const instanceId = `${section}-${Date.now()}`;

      this.instances.set(instanceId, {
        container,
        section,
        currentIndex: 0,
        autoTimer: null,
        pauseTimer: null,
        fallbackIndex: 0,
        isAdBlocked: false
      });

      // 以前にブロックされていた場合は即座にフォールバック表示
      if (this.getBlockedStatus()) {
        const instance = this.instances.get(instanceId);
        instance.isAdBlocked = true;
        this.renderFallback(instanceId);
        return;
      }

      if (!this.isLoaded) {
        this.loadAds().then(success => {
          if (success) {
            this.renderBanner(instanceId);
          } else {
            container.innerHTML = '';
          }
        });
        return;
      }

      this.renderBanner(instanceId);
    }

    /**
     * バナーを描画
     */
    renderBanner(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      const ads = this.adsData[instance.section] || [];
      if (ads.length === 0) {
        console.warn(`[neuvecom-common] セクション "${instance.section}" に広告がありません`);
        return;
      }

      this.createBannerUI(instanceId, ads);
      this.renderCurrentAd(instanceId);
      this.checkAdBlocked(instanceId);

      if (ads.length > 1) {
        this.startAutoSwitch(instanceId);
      }
    }

    /**
     * バナーUIを作成
     */
    createBannerUI(instanceId, ads) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      const controlsHtml = ads.length > 1 ? `
        <div class="affiliate-banner-controls">
          <button class="affiliate-banner-nav prev" data-instance="${instanceId}" aria-label="前の広告">&lt;</button>
          <span class="affiliate-banner-indicator">
            <span class="current">1</span>/<span class="total">${ads.length}</span>
          </span>
          <button class="affiliate-banner-nav next" data-instance="${instanceId}" aria-label="次の広告">&gt;</button>
        </div>
      ` : '';

      instance.container.innerHTML = `
        <div class="affiliate-banner">
          <div class="affiliate-banner-wrapper">
            <div class="affiliate-banner-container">
              <iframe class="affiliate-iframe" scrolling="no" frameborder="0"></iframe>
            </div>
            ${controlsHtml}
            <p class="affiliate-thanks">ご協力ありがとうございます</p>
          </div>
        </div>
      `;

      if (ads.length > 1) {
        const prevBtn = instance.container.querySelector('.prev');
        const nextBtn = instance.container.querySelector('.next');

        if (prevBtn) {
          prevBtn.addEventListener('click', () => this.handleNav(instanceId, 'prev'));
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => this.handleNav(instanceId, 'next'));
        }
      }
    }

    /**
     * 現在の広告を描画
     */
    renderCurrentAd(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      const ads = this.adsData[instance.section] || [];
      const ad = ads[instance.currentIndex];
      if (!ad) return;

      const [width, height] = ad.size.split('x').map(v => parseInt(v, 10) || 468);
      const iframe = instance.container.querySelector('.affiliate-iframe');

      if (!iframe) return;

      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const sid = this.config.sid;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: ${width}px;
              height: ${height}px;
              overflow: hidden;
              text-align: center;
              background: transparent;
            }
          </style>
        </head>
        <body>
          <script language="javascript" src="//ad.jp.ap.valuecommerce.com/servlet/jsbanner?sid=${sid}&pid=${ad.pid}"><\/script>
          <noscript>
            <a href="//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${ad.pid}" rel="nofollow">
              <img src="//ad.jp.ap.valuecommerce.com/servlet/gifbanner?sid=${sid}&pid=${ad.pid}" border="0">
            </a>
          </noscript>
        </body>
        </html>
      `);
      doc.close();

      const currentSpan = instance.container.querySelector('.current');
      if (currentSpan) {
        currentSpan.textContent = instance.currentIndex + 1;
      }
    }

    /**
     * 広告ブロック検出
     */
    checkAdBlocked(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      setTimeout(() => {
        const iframe = instance.container?.querySelector('.affiliate-iframe');
        if (!iframe) {
          return;
        }

        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) {
            this.handleAdBlocked(instanceId);
            return;
          }

          // 広告が正常に読み込まれた場合、scriptタグが画像やリンクを生成する
          // ブロックされた場合は、scriptタグは残るが画像/リンクは生成されない
          const images = doc.body?.querySelectorAll('img') || [];
          const links = doc.body?.querySelectorAll('a') || [];

          // 画像またはリンクが1つ以上あれば広告は正常に読み込まれている
          // (noscriptタグ内の要素はscript有効時には表示されないため、
          //  広告スクリプトが生成した要素のみがカウントされる)
          const hasGeneratedContent = images.length > 0 || links.length > 0;

          // 広告コンテンツが生成されていない場合はブロックされている
          if (!hasGeneratedContent) {
            this.handleAdBlocked(instanceId);
          }
        } catch (e) {
          // クロスオリジンエラーの場合、iframeのサイズで判断
          const iframeRect = iframe.getBoundingClientRect();
          if (iframeRect.height < 10 || iframeRect.width < 10) {
            this.handleAdBlocked(instanceId);
          }
        }
      }, this.config.adCheckDelay);
    }

    /**
     * 広告ブロック時の処理
     */
    handleAdBlocked(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      instance.isAdBlocked = true;
      this.setBlockedStatus(true);
      this.stopAutoSwitch(instanceId);
      this.renderFallback(instanceId);
    }

    /**
     * フォールバックバナーを描画
     */
    renderFallback(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        return;
      }

      const messages = this.config.fallbackMessages;
      if (!messages || messages.length === 0) {
        return;
      }

      instance.fallbackIndex = Math.floor(Math.random() * messages.length);
      this.renderCurrentFallback(instanceId);
      this.startFallbackRotation(instanceId);
    }

    /**
     * 現在のフォールバックメッセージを描画
     */
    renderCurrentFallback(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        return;
      }

      if (!instance.container) {
        return;
      }

      const messages = this.config.fallbackMessages;
      const msg = messages[instance.fallbackIndex];
      const basePath = this.getBasePath();
      const imgPath = this.config.fallbackImagesPath.startsWith('/')
        ? basePath + this.config.fallbackImagesPath.substring(1)
        : basePath + this.config.fallbackImagesPath;
      const imagePath = `${imgPath}${msg.image}`;

      instance.container.innerHTML = `
        <div class="affiliate-fallback">
          <div class="fallback-content">
            <div class="fallback-text">
              <p class="fallback-message">${msg.text}</p>
              <p class="fallback-note">このサイトは広告収入で運営されています</p>
            </div>
            <div class="fallback-image">
              <img src="${imagePath}" alt="Ferris" loading="lazy">
            </div>
          </div>
          <div class="fallback-indicator">
            <span class="current">${instance.fallbackIndex + 1}</span>/<span class="total">${messages.length}</span>
          </div>
        </div>
      `;
    }

    /**
     * フォールバックローテーション開始
     */
    startFallbackRotation(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      this.stopAutoSwitch(instanceId);
      const messages = this.config.fallbackMessages;

      if (messages.length <= 1) return;

      instance.autoTimer = setInterval(() => {
        const fallbackContent = instance.container?.querySelector('.fallback-content');
        if (fallbackContent) {
          fallbackContent.classList.add('fade-out');
        }

        setTimeout(() => {
          instance.fallbackIndex = (instance.fallbackIndex + 1) % messages.length;
          this.renderCurrentFallback(instanceId);
        }, this.config.fadeDuration);
      }, this.config.interval);
    }

    /**
     * ナビゲーション処理
     */
    handleNav(instanceId, direction) {
      this.pauseAutoSwitch(instanceId);
      this.switchAd(instanceId, direction);
    }

    /**
     * 広告切替
     */
    switchAd(instanceId, direction) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      // 広告ブロック状態の場合は切り替えしない
      if (instance.isAdBlocked) return;

      const ads = this.adsData[instance.section] || [];
      const bannerContainer = instance.container.querySelector('.affiliate-banner-container');
      if (bannerContainer) {
        bannerContainer.classList.add('fade-out');
      }

      setTimeout(() => {
        if (direction === 'next') {
          instance.currentIndex = (instance.currentIndex + 1) % ads.length;
        } else {
          instance.currentIndex = (instance.currentIndex - 1 + ads.length) % ads.length;
        }
        this.renderCurrentAd(instanceId);
        if (bannerContainer) {
          bannerContainer.classList.remove('fade-out');
        }
      }, this.config.fadeDuration);
    }

    /**
     * 自動切替開始
     */
    startAutoSwitch(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      this.stopAutoSwitch(instanceId);
      instance.autoTimer = setInterval(() => {
        this.switchAd(instanceId, 'next');
      }, this.config.interval);
    }

    /**
     * 自動切替停止
     */
    stopAutoSwitch(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      if (instance.autoTimer) {
        clearInterval(instance.autoTimer);
        instance.autoTimer = null;
      }
    }

    /**
     * 自動切替一時停止
     */
    pauseAutoSwitch(instanceId) {
      const instance = this.instances.get(instanceId);
      if (!instance) return;

      this.stopAutoSwitch(instanceId);

      if (instance.pauseTimer) {
        clearTimeout(instance.pauseTimer);
      }

      instance.pauseTimer = setTimeout(() => {
        this.startAutoSwitch(instanceId);
      }, this.config.pauseDuration);
    }

    /**
     * 広告ブロック状態をリセット（デバッグ用）
     */
    resetBlockedStatus() {
      this.setBlockedStatus(false);
      this.instances.forEach((instance) => {
        instance.isAdBlocked = false;
      });
    }

    /**
     * クリーンアップ
     */
    destroy() {
      this.instances.forEach((instance, instanceId) => {
        this.stopAutoSwitch(instanceId);
        if (instance.pauseTimer) {
          clearTimeout(instance.pauseTimer);
        }
      });
      this.instances.clear();
    }
  }

  // グローバルに公開
  window.NeuvecomAffiliateBanner = AffiliateBannerManager;
})();
