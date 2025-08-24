/**
 * CSV Loader - BOM付きUTF-8対応
 * 夢境の守護者専用CSVローダー
 * 
 * 仕様:
 * - BOM付きUTF-8ファイルの読み込み対応
 * - Excel直接編集対応（文字化け防止）
 * - CRLF改行コード対応
 * - キャッシュシステム搭載
 * - エラーハンドリング
 */

class CSVLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.encoding = 'UTF-8';
        this.separator = ',';
        this.lineBreak = '\r\n';
        this.BOM = '\uFEFF'; // UTF-8 BOM
        
        console.log('🔧 CSV Loader initialized - BOM付きUTF-8対応');
    }

    /**
     * CSVファイルを読み込む
     * @param {string} filename - ファイル名
     * @param {boolean} useCache - キャッシュを使用するか（デフォルト: true）
     * @returns {Promise<Array>} パースされたCSVデータ
     */
    async loadCSV(filename, useCache = true) {
        try {
            // キャッシュチェック
            if (useCache && this.cache.has(filename)) {
                console.log(`📦 Loading from cache: ${filename}`);
                return this.cache.get(filename);
            }

            // 重複読み込み防止
            if (this.loadingPromises.has(filename)) {
                console.log(`⏳ Waiting for existing load: ${filename}`);
                return await this.loadingPromises.get(filename);
            }

            // 読み込み開始
            console.log(`📂 Loading CSV: ${filename}`);
            const loadPromise = this._loadCSVFile(filename);
            this.loadingPromises.set(filename, loadPromise);

            const data = await loadPromise;
            
            // キャッシュに保存
            if (useCache) {
                this.cache.set(filename, data);
                console.log(`💾 Cached CSV data: ${filename} (${data.length} records)`);
            }

            this.loadingPromises.delete(filename);
            return data;

        } catch (error) {
            this.loadingPromises.delete(filename);
            console.error(`❌ Failed to load CSV ${filename}:`, error);
            throw new Error(`CSV読み込みエラー: ${filename} - ${error.message}`);
        }
    }

    /**
     * CSVファイルを実際に読み込む（内部メソッド）
     * @private
     */
    async _loadCSVFile(filename) {
        const response = await fetch(`data/${filename}`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        // ArrayBufferとして読み込んで、正確なエンコーディング処理を行う
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // BOM検出と除去
        let textContent = this._decodeWithBOMHandling(uint8Array);
        
        // CSV解析
        const data = this._parseCSV(textContent);
        
        // データ検証
        this._validateCSVData(data, filename);
        
        return data;
    }

    /**
     * BOMを考慮してテキストをデコード
     * @private
     */
    _decodeWithBOMHandling(uint8Array) {
        let startIndex = 0;
        
        // UTF-8 BOM検出 (EF BB BF)
        if (uint8Array.length >= 3 &&
            uint8Array[0] === 0xEF &&
            uint8Array[1] === 0xBB &&
            uint8Array[2] === 0xBF) {
            startIndex = 3;
            console.log('✅ BOM detected and removed');
        } else {
            console.log('ℹ️ No BOM found in file');
        }
        
        // UTF-8デコード
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(uint8Array.slice(startIndex));
    }

    /**
     * CSVテキストを解析
     * @private
     */
    _parseCSV(text) {
        // 改行コード正規化（CRLF、LF、CRすべてに対応）
        const normalizedText = text.replace(/\r\n|\r|\n/g, '\n');
        const lines = normalizedText.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            throw new Error('CSVファイルが空です');
        }

        // ヘッダー行の解析
        const headers = this._parseCSVLine(lines[0]);
        if (headers.length === 0) {
            throw new Error('CSVヘッダーが見つかりません');
        }

        console.log(`📋 CSV Headers: [${headers.join(', ')}]`);
        
        // データ行の解析
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this._parseCSVLine(lines[i]);
                
                // 空行をスキップ
                if (values.length === 0 || values.every(v => v === '')) {
                    continue;
                }
                
                // オブジェクト作成
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] !== undefined ? values[index] : '';
                });
                
                data.push(row);
            } catch (error) {
                console.warn(`⚠️ Skipping invalid line ${i + 1}: ${error.message}`);
            }
        }

        console.log(`✅ Parsed ${data.length} data rows`);
        return data;
    }

    /**
     * CSV行を解析（カンマ区切り、ダブルクォート対応）
     * @private
     */
    _parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // エスケープされたダブルクォート
                    current += '"';
                    i += 2;
                } else {
                    // クォート開始/終了
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === this.separator && !inQuotes) {
                // フィールド区切り
                result.push(this._cleanCSVValue(current));
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        // 最後のフィールドを追加
        result.push(this._cleanCSVValue(current));
        
        return result;
    }

    /**
     * CSV値のクリーンアップ
     * @private
     */
    _cleanCSVValue(value) {
        // 前後の空白を除去
        value = value.trim();
        
        // 数値変換の試行
        if (value !== '' && !isNaN(value) && !isNaN(parseFloat(value))) {
            const numValue = parseFloat(value);
            if (Number.isInteger(numValue) && value.indexOf('.') === -1) {
                return parseInt(value, 10);
            }
            return numValue;
        }
        
        // ブール値の変換
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        
        return value;
    }

    /**
     * CSVデータの検証
     * @private
     */
    _validateCSVData(data, filename) {
        if (!Array.isArray(data)) {
            throw new Error('CSVデータが配列ではありません');
        }
        
        if (data.length === 0) {
            console.warn(`⚠️ CSV file ${filename} is empty`);
            return;
        }
        
        // 最初の行のキーを基準として一貫性をチェック
        const expectedKeys = Object.keys(data[0]);
        let inconsistentRows = 0;
        
        for (let i = 1; i < Math.min(data.length, 10); i++) {
            const currentKeys = Object.keys(data[i]);
            if (currentKeys.length !== expectedKeys.length || 
                !expectedKeys.every(key => currentKeys.includes(key))) {
                inconsistentRows++;
            }
        }
        
        if (inconsistentRows > 0) {
            console.warn(`⚠️ Found ${inconsistentRows} rows with inconsistent structure in ${filename}`);
        }
        
        console.log(`✅ CSV validation completed for ${filename}`);
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ CSV cache cleared');
    }

    /**
     * 特定ファイルのキャッシュを削除
     */
    clearFileCache(filename) {
        if (this.cache.has(filename)) {
            this.cache.delete(filename);
            console.log(`🗑️ Cache cleared for ${filename}`);
        }
    }

    /**
     * キャッシュ状態を取得
     */
    getCacheStatus() {
        return {
            size: this.cache.size,
            files: Array.from(this.cache.keys())
        };
    }

    /**
     * 複数のCSVファイルを並行して読み込む
     */
    async loadMultiple(filenames, useCache = true) {
        console.log(`🚀 Loading ${filenames.length} CSV files in parallel...`);
        
        try {
            const promises = filenames.map(filename => 
                this.loadCSV(filename, useCache)
            );
            
            const results = await Promise.all(promises);
            
            // 結果をファイル名をキーとするオブジェクトに変換
            const data = {};
            filenames.forEach((filename, index) => {
                data[filename] = results[index];
            });
            
            console.log(`✅ Successfully loaded ${filenames.length} CSV files`);
            return data;
            
        } catch (error) {
            console.error('❌ Error loading multiple CSV files:', error);
            throw error;
        }
    }

    /**
     * CSVファイル一覧を取得（開発/デバッグ用）
     */
    async getAvailableFiles() {
        try {
            // 一般的なCSVファイル名のリストを返す（実装依存）
            return [
                'scenes.csv',
                'characters.csv',
                'dialogues.csv',
                'character_levels.csv',
                'endings.csv',
                'ui_elements.csv',
                'ui_panels.csv',
                'ui_icons.csv',
                'click_areas.csv',
                'ui_animations.csv',
                'ui_fonts.csv',
                'ui_responsive.csv',
                'game_balance.csv',
                'sound_effects.csv',
                'memory_skills.csv',
                'battle_enemies.csv',
                'story_flags.csv',
                'ui_texts.csv'
            ];
        } catch (error) {
            console.error('❌ Error getting file list:', error);
            return [];
        }
    }

    /**
     * Excelでの編集用にBOM付きUTF-8でCSVを生成
     */
    generateBOMCSV(data, filename) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('データが無効です');
        }
        
        let csvContent = this.BOM; // BOMを先頭に追加
        
        // ヘッダー行
        const headers = Object.keys(data[0]);
        csvContent += headers.join(this.separator) + this.lineBreak;
        
        // データ行
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header] || '';
                
                // 文字列で、カンマやダブルクォートを含む場合はエスケープ
                if (typeof value === 'string' && 
                    (value.includes(this.separator) || value.includes('"') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                
                return value;
            });
            csvContent += values.join(this.separator) + this.lineBreak;
        });
        
        // ファイルダウンロード
        const blob = new Blob([csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`💾 Generated BOM UTF-8 CSV: ${filename}`);
    }
}

// グローバルインスタンス
const csvLoader = new CSVLoader();

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.CSVLoader = CSVLoader;
    window.csvLoader = csvLoader;
}

// エクスポート（モジュール環境用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVLoader;
}

console.log('📚 CSV Loader module loaded - Ready for BOM UTF-8 files');