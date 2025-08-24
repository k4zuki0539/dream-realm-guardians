# 夢境の守護者 - 完全ゲーム仕様書
## Dream Realm Guardians - Complete Game Specification

---

## 📋 プロジェクト概要

### ゲーム基本情報
- **タイトル**: 夢境の守護者（Dream Realm Guardians）
- **ジャンル**: ターン制バトルシミュレーション + 感情成長RPG
- **プラットフォーム**: Electron (Windows/Mac/Linux対応)
- **プレイ時間**: 体験版15-20分、完全版想定2-3時間
- **対象年齢**: 12歳以上

### 🎯 ゲームコンセプト
夢の世界「夢境（ムキョウ）」で活動する守護者となり、悪夢に侵食された人々の心を救うターン制バトルゲーム。プレイヤーは「記憶」「感情」「希望」の3つの力を組み合わせて戦闘し、自分自身の精神的成長も体験する。

### 🌟 独創的なゲームシステム
1. **感情共鳴システム**: バトル中に相手の感情を読み取り、適切な「記憶の欠片」で共鳴を起こしてダメージを与える
2. **記憶合成システム**: 複数の記憶を組み合わせて新しいスキルを作り出す
3. **内面成長システム**: プレイスタイルにより主人公の内面と外見が5段階で変化
4. **感情の天秤システム**: 戦闘での選択が「希望」「絶望」「共感」「孤独」の4つの感情値に影響し、エンディングを決定

---

## 🖥️ 必須4画面UI設計

### 1. タイトル画面
```
┌─────────────────────────────────────────────────────────────┐
│                      🌙 夢境の守護者 🌙                      │
│                                                           │
│         [背景: 星空と浮遊する記憶の欠片のアニメーション]         │
│                                                           │
│              ┌─ 新しい夢へ（NEW GAME）─┐                 │
│              │                      │                 │
│              ├─ 記憶を辿る（CONTINUE）─┤                 │
│              │                      │                 │
│              ├─ 設定（OPTIONS）      ─┤                 │
│              │                      │                 │
│              └─ 覚醒（EXIT）        ─┘                 │
│                                                           │
│    [左下: 主人公立ち絵]        [右下: 音量スライダー]      │
│    [感情表現: 期待・不安]      [BGM: 神秘的なオーケストラ]  │
└─────────────────────────────────────────────────────────────┘
```

**インタラクティブ要素**:
- メニューホバーで記憶の欠片が光る
- 立ち絵が微細な呼吸アニメーション
- クリック時に星が散るエフェクト

### 2. 会話シーン画面
```
┌─────────────────────────────────────────────────────────────┐
│  [背景: 夢の世界のシーン - 学校/家/公園等が幻想的に描画]      │
│                                                           │
│         [左: NPCキャラ立ち絵]    [右: 主人公立ち絵]        │
│         [感情アイコン]           [感情アイコン]            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 「あの時の記憶が、まだ心に残っているのね...」         │  │
│  │ [タイプライター効果でテキスト表示]                 │  │
│  │                                               │  │
│  │              [▶️ 次へ]                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [左下: 記憶ゲージ] [中央: 感情状態表示] [右下: Skip/Auto] │
└─────────────────────────────────────────────────────────────┘
```

**特殊機能**:
- 感情に応じて立ち絵の表情が動的変化
- 重要な記憶シーンで背景がゆっくり変化
- 選択肢で感情値が変動する視覚表現

### 3. メインゲーム画面（バトル）
```
┌─────────────────────────────────────────────────────────────┐
│[敵: 悪夢の化身]  HP: ■■■■□ 感情: 絶望MAX 弱点: 希望      │
│                                                           │
│     ┌─記憶スキル選択─┐  ┌─感情共鳴─┐  ┌─アイテム─┐    │
│     │💭 幼い日の記憶  │  │💝 共感力  │  │🌟 希望の欠片│    │
│     │⭐ 成功の思い出  │  │😢 悲しみ  │  │🔮 記憶結晶 │    │
│     │🏠 家族の絆    │  │😊 喜び   │  │💊 回復薬   │    │
│     └─────────────┘  └─────────┘  └─────────┘    │
│                                                           │
│     ターン: 3/10  行動力: ●●○  記憶力: 85/100          │
│                                                           │
│  ┌─戦闘ログ─────────────────────────────────────────────┐  │
│  │> 敵の絶望の波動！ 主人公は悲しみに包まれた...       │  │
│  │> 主人公は「幼い日の記憶」を使用！                 │  │
│  │> 温かい記憶が敵の心に響いた... 絶望が和らいでいる   │  │
│  └───────────────────────────────────────────────┘  │
│                                                           │
│ [主人公] HP: ■■■■■ 感情: 希望75 共感50 絶望25 孤独10   │
└─────────────────────────────────────────────────────────┘
```

**ゲームプレイ要素**:
- 敵の感情状態を読み取って適切な記憶スキルを選択
- 記憶の組み合わせで新スキル生成
- 感情値がリアルタイムで変動する表示

### 4. マルチエンディング画面（4種類）

#### エンディング1: 希望の光
```
┌─────────────────────────────────────────────────────────────┐
│              🌅 希望の光エンディング 🌅                      │
│                                                           │
│  [背景: 朝焼けの夢境、平和になった世界]                     │
│                                                           │
│              [主人公: 希望に満ちた表情の立ち絵]              │
│                                                           │
│  「多くの人の心を救い、私も成長することができました。        │
│   夢境の守護者として、これからも人々の希望を守り続けます。」  │
│                                                           │
│  達成率: ★★★★★ (希望値80以上、救済率90%以上)             │
│  [BGM: 壮大で希望に満ちたオーケストラ]                      │
│                                                           │
│         [もう一度プレイする] [メニューに戻る]               │
└─────────────────────────────────────────────────────────────┘
```

#### エンディング2: 共感の絆
```
┌─────────────────────────────────────────────────────────────┐
│              💝 共感の絆エンディング 💝                      │
│  [背景: 人々が手を繋ぐ温かな夢の世界]                       │
│  「一人では解決できないことも、みんなと一緒なら...」        │
└─────────────────────────────────────────────────────────────┘
```

#### エンディング3: 内省の道
```
┌─────────────────────────────────────────────────────────────┐
│              🌙 内省の道エンディング 🌙                      │
│  [背景: 静寂な月夜、一人佇む主人公]                         │
│  「自分自身と向き合うことの大切さを学びました。」            │
└─────────────────────────────────────────────────────────────┘
```

#### エンディング4: 再生の始まり
```
┌─────────────────────────────────────────────────────────────┐
│              ✨ 再生の始まりエンディング ✨                   │
│  [背景: 新たな夢境の入り口、希望と不安が混在]                │
│  「終わりは新しい始まり。次の冒険が私を待っています。」      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 詳細ゲームシステム

### 感情共鳴バトルシステム
1. **感情読み取り**: 敵の感情状態（絶望・怒り・悲しみ・恐怖）を分析
2. **記憶選択**: 対応する記憶スキル（希望・愛情・喜び・勇気）で共鳴
3. **効果計算**: 相性により1.5倍～0.5倍のダメージ補正
4. **成長要素**: 使用した記憶が強化され、新しい組み合わせが解放

### 記憶合成システム
- **基本記憶**: 単体効果のスキル（15種類）
- **合成記憶**: 2-3個の基本記憶を組み合わせて生成（50種類以上）
- **特殊記憶**: ストーリー進行で獲得する固有記憶（10種類）

例：
- 「幼い日の記憶」+ 「家族の絆」= 「温かな帰る場所」（大回復+状態異常無効）
- 「成功の思い出」+ 「友人の支え」= 「共に歩んだ道」（攻撃+味方強化）

### プレイヤー成長システム（5段階）
1. **初心者守護者**: 基本的な記憶スキルのみ使用可能
2. **見習い守護者**: 記憶合成の基礎を習得
3. **熟練守護者**: 複雑な記憶合成が可能
4. **上級守護者**: 相手の深層心理を読み取れる
5. **マスター守護者**: 自分の記憶も武器として使用可能

各段階で主人公の衣装・髪型・表情・立ち絵が変化

---

## 👥 キャラクター設定

### 主人公: 夢野 希（ユメノ ノゾミ）
- **年齢**: 16歳
- **性格**: 内向的だが芯が強い
- **特殊能力**: 人の記憶を視覚化し、感情と共鳴する力
- **成長軌跡**: 自信のない少女 → 他者を救う強い意志を持つ守護者

**外見変化5段階**:
1. **不安期**: 暗い色の制服、俯きがちな表情
2. **模索期**: 制服に守護者のエンブレム追加、少し前向きな表情
3. **成長期**: 守護者見習いの装束、自信を持った表情
4. **確信期**: 正式な守護者ローブ、決意の表情
5. **完成期**: オリジナルデザインの装束、他者への慈愛に満ちた表情

### サポートキャラクター: 記憶の案内人 ルシード
- **外見**: 青い髪の神秘的な少年
- **役割**: ゲームシステムのナビゲーター
- **特徴**: 夢境の住人で、記憶の力について教えてくれる

### 対戦相手: 悪夢の化身たち
1. **絶望の影**: 失恋や挫折の記憶から生まれる
2. **怒りの炎**: 裏切りや理不尽な体験から生まれる
3. **恐怖の霧**: トラウマや不安から生まれる
4. **孤独の氷**: 孤立感や疎外感から生まれる

---

## 🎯 4種類エンディング分岐システム

### エンディング判定条件

```javascript
// エンディング判定ロジック
const endingConditions = {
    希望の光: { hope: 80, empathy: 60, despair: 20, loneliness: 30, saveRate: 90 },
    共感の絆: { hope: 60, empathy: 80, despair: 30, loneliness: 20, saveRate: 80 },
    内省の道: { hope: 50, empathy: 40, despair: 40, loneliness: 60, saveRate: 70 },
    再生の始まり: { hope: 40, empathy: 50, despair: 60, loneliness: 50, saveRate: 60 }
};
```

### 各エンディングの特徴

1. **希望の光** (Best Ending)
   - **条件**: 希望80+、共感60+、救済率90%+
   - **内容**: 最も多くの人を救い、自分も成長した完璧な結末
   - **BGM**: 壮大な希望の交響曲
   - **特殊演出**: 救った人々が感謝のメッセージを送る

2. **共感の絆** (Good Ending)
   - **条件**: 共感80+、希望60+、救済率80%+
   - **内容**: 人とのつながりの大切さを学んだ温かい結末
   - **BGM**: 温かなアコースティック音楽
   - **特殊演出**: 仲間たちとの絆が描かれる

3. **内省の道** (Normal Ending)
   - **条件**: 孤独60+、内省的選択多数
   - **内容**: 自分自身と向き合い、一人でも歩んでいく決意
   - **BGM**: 静寂で美しいピアノソロ
   - **特殊演出**: 主人公の内面的成長が描かれる

4. **再生の始まり** (Restart Ending)
   - **条件**: 絶望値高、または失敗が多い場合
   - **内容**: 挫折を経験したが、再び立ち上がる意志を持つ
   - **BGM**: 切ないが前向きなメロディー
   - **特殊演出**: 新たな冒険への扉が開く

---

## 📊 CSV完全外部化システム（BOM付きUTF-8）

### 🚨 重要: エンコーディング仕様
**全CSVファイルは以下の仕様で生成される**:
- **エンコーディング**: BOM付きUTF-8（ファイル先頭に `\uFEFF` を付与）
- **改行コード**: CRLF（`\r\n`）でWindows/Excel完全対応
- **区切り文字**: カンマ（`,`）
- **エスケープ**: ダブルクォート（`"`）で囲む
- **Excel対応**: ダブルクリックで開いても日本語が文字化けしない

### 必須CSVファイル一覧（15個以上）

#### 1. scenes.csv - シーン管理
```csv
scene_id,scene_name,background_image,bgm_file,transition_type,duration
title,タイトル画面,bg_title_stars.png,bgm_mystical.mp3,fade,2000
intro_1,物語の始まり,bg_school_fantasy.png,bgm_gentle.mp3,slide,1500
battle_1,最初の戦闘,bg_nightmare_realm.png,bgm_battle_1.mp3,flash,500
ending_hope,希望の光,bg_sunrise.png,bgm_hope_finale.mp3,light,3000
```

#### 2. characters.csv - キャラクター設定
```csv
char_id,name_jp,name_en,age,personality,description,voice_type,base_image
protag,夢野希,Nozomi Yumeno,16,内向的で優しい,夢境の守護者見習い,soft_female,char_nozomi_base.png
lucid,ルシード,Lucid,???,神秘的,記憶の案内人,calm_male,char_lucid_base.png
nightmare_1,絶望の影,Shadow of Despair,???,破滅的,失恋から生まれた悪夢,deep_distorted,enemy_despair.png
```

#### 3. dialogues.csv - 会話データ
```csv
dialogue_id,scene_id,character_id,text_jp,emotion,voice_file,delay_ms,choice_flag
dlg_001,intro_1,protag,「ここは...夢の世界？」,confusion,voice_001.mp3,50,false
dlg_002,intro_1,lucid,「君が新しい守護者候補だね。」,gentle,voice_002.mp3,40,false
dlg_003,intro_1,protag,「私に...人を救えるの？」,anxiety,voice_003.mp3,60,true
```

#### 4. character_levels.csv - レベル別外見変化
```csv
char_id,level,outfit_image,face_expression,special_effects,unlock_condition
protag,1,outfit_school_uniform.png,anxious,none,game_start
protag,2,outfit_emblem_uniform.png,curious,faint_glow,hope_20
protag,3,outfit_apprentice_robe.png,determined,blue_aura,hope_40
protag,4,outfit_guardian_robe.png,confident,golden_aura,hope_60
protag,5,outfit_master_guardian.png,compassionate,rainbow_aura,hope_80
```

#### 5. endings.csv - エンディング設定
```csv
ending_id,name_jp,name_en,hope_min,empathy_min,despair_max,loneliness_max,save_rate_min,priority
end_hope,希望の光,Light of Hope,80,60,20,30,90,1
end_empathy,共感の絆,Bond of Empathy,60,80,30,20,80,2
end_introspection,内省の道,Path of Introspection,50,40,100,60,70,3
end_renewal,再生の始まり,New Beginning,0,0,100,100,0,4
```

#### 6. ui_elements.csv - UI要素設定
```csv
element_id,image_file,x_pos,y_pos,width,height,z_index,click_sound,hover_effect
btn_new_game,btn_new_game.png,400,300,200,50,10,click_menu.mp3,glow_blue
btn_continue,btn_continue.png,400,360,200,50,10,click_menu.mp3,glow_blue
btn_options,btn_options.png,400,420,200,50,10,click_menu.mp3,glow_blue
btn_exit,btn_exit.png,400,480,200,50,10,click_menu.mp3,glow_red
```

#### 7. ui_panels.csv - パネル配置
```csv
panel_id,background_image,x_pos,y_pos,width,height,opacity,border_style,animation
dialog_box,panel_dialog.png,50,450,700,150,0.9,rounded,slide_up
battle_hud,panel_battle_hud.png,0,0,800,100,0.8,none,fade_in
status_panel,panel_status.png,600,150,180,300,0.85,gradient,none
```

#### 8. ui_icons.csv - アイコン設定
```csv
icon_id,image_file,tooltip_text,category,size,glow_color
icon_hope,icon_hope.png,希望の力,emotion,32,gold
icon_empathy,icon_empathy.png,共感の力,emotion,32,pink
icon_memory,icon_memory.png,記憶の欠片,item,24,blue
icon_heal,icon_heal.png,回復アイテム,item,24,green
```

#### 9. click_areas.csv - クリック可能エリア
```csv
area_id,scene_id,x_pos,y_pos,width,height,click_effect,sound_file,action
area_menu_start,title,350,280,300,80,particle_sparkle,click_confirm.mp3,start_game
area_char_talk,dialog,100,150,150,300,ripple_effect,click_gentle.mp3,advance_dialog
```

#### 10. ui_animations.csv - アニメーション設定
```csv
anim_id,target_element,animation_type,duration_ms,easing,loop,trigger_condition
sparkle_menu,btn_new_game,sparkle_particles,2000,ease_in_out,true,hover
level_up_glow,character_portrait,radial_glow,1500,ease_out,false,level_change
text_typewriter,dialog_text,typewriter,50,linear,false,dialog_start
```

#### 11. ui_fonts.csv - フォント設定
```csv
font_id,font_family,font_size,color,shadow_color,shadow_offset,weight,usage
font_title,serif,36,#FFD700,#000000,2px 2px,bold,title_screen
font_dialog,sans-serif,18,#FFFFFF,#000080,1px 1px,normal,character_dialog
font_ui,monospace,14,#CCCCCC,#000000,1px 1px,normal,ui_elements
```

#### 12. ui_responsive.csv - レスポンシブ対応
```csv
screen_size,min_width,scale_factor,ui_layout,font_scale
small,800,0.8,compact,0.9
medium,1024,1.0,standard,1.0
large,1440,1.2,expanded,1.1
xlarge,1920,1.5,full,1.2
```

#### 13. game_balance.csv - ゲームバランス
```csv
balance_id,parameter_name,base_value,level_multiplier,max_value,description
player_hp,体力,100,1.2,500,プレイヤーの最大体力
memory_power,記憶力,50,1.5,300,記憶スキルの威力
emotion_gain,感情獲得率,1.0,1.1,3.0,戦闘での感情値上昇率
exp_required,必要経験値,100,1.8,10000,レベルアップ必要経験値
```

#### 14. sound_effects.csv - 音響設定
```csv
sound_id,file_name,volume,category,loop_flag,fade_in_ms,fade_out_ms
bgm_title,mystical_dreams.mp3,0.7,background,true,2000,1500
se_click,ui_click.mp3,0.5,interface,false,0,0
se_battle_hit,battle_impact.mp3,0.8,battle,false,0,100
voice_protag_1,nozomi_voice_01.mp3,0.9,voice,false,0,0
```

#### 15. memory_skills.csv - 記憶スキル
```csv
skill_id,name_jp,name_en,base_power,emotion_type,mp_cost,description,unlock_condition
mem_childhood,幼い日の記憶,Childhood Memory,30,hope,10,温かい記憶で心を癒す,level_1
mem_success,成功の思い出,Success Memory,40,confidence,15,達成感で勇気を与える,level_2
mem_family,家族の絆,Family Bond,25,empathy,12,家族の愛で守りを固める,level_1
```

#### 16. battle_enemies.csv - バトル敵データ
```csv
enemy_id,name_jp,hp,attack_power,weakness_emotion,resist_emotion,special_ability
nightmare_despair,絶望の影,120,35,hope,despair,絶望の波動
nightmare_anger,怒りの炎,100,45,empathy,anger,炎の怒り
nightmare_fear,恐怖の霧,80,25,courage,fear,恐怖の幻影
```

#### 17. story_flags.csv - ストーリーフラグ
```csv
flag_id,flag_name,initial_value,description,related_scene
rescued_count,救済した人数,0,エンディング分岐に影響,all_battles
hope_level,希望値,0,主人公の希望の強さ,all_scenes
first_battle,初回戦闘完了,false,チュートリアル管理,battle_tutorial
```

### CSV生成・管理システム実装例

```javascript
// BOM付きUTF-8でCSVを生成する関数
function generateBOMCSV(data, filename) {
    const BOM = '\uFEFF'; // BOM for UTF-8
    let csvContent = BOM;
    
    // ヘッダー行
    csvContent += Object.keys(data[0]).join(',') + '\r\n';
    
    // データ行
    data.forEach(row => {
        const values = Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') 
                ? `"${val}"` 
                : val
        );
        csvContent += values.join(',') + '\r\n';
    });
    
    // ファイル保存（Excel対応）
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
```

---

## 🎨 UI画像・アニメーション仕様

### 必須UI画像ファイル構成

#### ボタン画像（3状態）
```
/assets/ui/buttons/
├── btn_new_game_normal.png (200x50px)
├── btn_new_game_hover.png (200x50px, 発光エフェクト)
├── btn_new_game_pressed.png (200x50px, 押下エフェクト)
├── btn_continue_normal.png
├── btn_continue_hover.png
├── btn_continue_pressed.png
└── ...全ボタンセット
```

#### パネル・背景画像
```
/assets/ui/panels/
├── panel_dialog_box.png (700x150px, 半透明)
├── panel_battle_hud.png (800x100px, 戦闘UI背景)
├── panel_status.png (180x300px, ステータス表示)
└── panel_options.png (400x300px, 設定パネル)

/assets/backgrounds/
├── bg_title_stars.png (1024x768px, 星空)
├── bg_school_fantasy.png (1024x768px, 幻想的な学校)
├── bg_nightmare_realm.png (1024x768px, 悪夢の世界)
└── bg_sunrise.png (1024x768px, 希望のエンディング)
```

#### キャラクター立ち絵（成長段階別）
```
/assets/characters/
├── nozomi_level1_normal.png (300x600px)
├── nozomi_level1_happy.png
├── nozomi_level1_sad.png
├── nozomi_level1_angry.png
├── nozomi_level2_normal.png
└── ...各レベル・感情セット

/assets/enemies/
├── nightmare_despair.png (400x400px)
├── nightmare_anger.png
└── nightmare_fear.png
```

### アニメーション仕様

#### 1. メニューアニメーション
```css
/* ホバーエフェクト */
.menu-button:hover {
    animation: glow-pulse 1s infinite alternate;
    transform: scale(1.05);
    transition: all 0.3s ease;
}

@keyframes glow-pulse {
    0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
    100% { box-shadow: 0 0 20px rgba(255, 215, 0, 1); }
}
```

#### 2. レベルアップエフェクト
```css
.level-up-animation {
    animation: level-up-sequence 2s ease-out;
}

@keyframes level-up-sequence {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    25% { transform: scale(1.2) rotate(5deg); opacity: 0.8; }
    50% { transform: scale(1.3) rotate(-5deg); opacity: 1; }
    75% { transform: scale(1.1) rotate(2deg); opacity: 0.9; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

#### 3. 戦闘エフェクト
```javascript
// 記憶スキル使用時のパーティクルエフェクト
class MemorySkillEffect {
    constructor(skillType) {
        this.particles = [];
        this.colors = {
            hope: ['#FFD700', '#FFA500', '#FFFF00'],
            empathy: ['#FF69B4', '#FF1493', '#DC143C'],
            courage: ['#FF4500', '#FF6347', '#FF7F50']
        };
    }
    
    createParticles(x, y, count = 50) {
        for(let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, this.colors[this.skillType]));
        }
    }
    
    animate(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
            particle.render();
        });
    }
}
```

#### 4. テキストアニメーション
```javascript
// タイプライター効果
class TypewriterEffect {
    constructor(text, element, speed = 50) {
        this.text = text;
        this.element = element;
        this.speed = speed;
        this.currentIndex = 0;
    }
    
    start() {
        const timer = setInterval(() => {
            if (this.currentIndex < this.text.length) {
                this.element.textContent += this.text[this.currentIndex];
                this.currentIndex++;
            } else {
                clearInterval(timer);
            }
        }, this.speed);
    }
}
```

---

## ⚙️ 技術実装仕様

### HTML5基本構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>夢境の守護者</title>
    <link rel="stylesheet" href="styles/game.css">
</head>
<body>
    <div id="game-container">
        <div id="title-screen" class="screen active"></div>
        <div id="dialog-screen" class="screen"></div>
        <div id="battle-screen" class="screen"></div>
        <div id="ending-screen" class="screen"></div>
    </div>
    <script src="js/csvLoader.js"></script>
    <script src="js/gameEngine.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### CSS基本スタイル
```css
/* レスポンシブ基本設定 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#game-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
}

.screen {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}

.screen.active {
    opacity: 1;
    z-index: 1;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
    #game-container {
        transform: scale(0.8);
        transform-origin: top left;
    }
}

@media (max-width: 768px) {
    #game-container {
        transform: scale(0.6);
        transform-origin: top left;
    }
}
```

### JavaScriptコア実装

#### 1. CSVローダー（BOM付きUTF-8対応）
```javascript
class CSVLoader {
    constructor() {
        this.cache = new Map();
    }
    
    async loadCSV(filename) {
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }
        
        try {
            const response = await fetch(`data/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            
            let text = await response.text();
            
            // BOM除去（存在する場合）
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
            }
            
            const data = this.parseCSV(text);
            this.cache.set(filename, data);
            return data;
        } catch (error) {
            console.error(`Error loading CSV ${filename}:`, error);
            throw error;
        }
    }
    
    parseCSV(text) {
        const lines = text.split('\r\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            data.push(row);
        }
        
        return data;
    }
    
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
}
```

#### 2. ゲームエンジン
```javascript
class GameEngine {
    constructor() {
        this.csvLoader = new CSVLoader();
        this.gameState = {
            currentScene: 'title',
            playerData: {
                level: 1,
                hope: 0,
                empathy: 0,
                despair: 0,
                loneliness: 0,
                savedCount: 0
            },
            flags: new Map()
        };
        this.scenes = new Map();
        this.characters = new Map();
        this.dialogues = [];
    }
    
    async initialize() {
        console.log('Initializing Dream Realm Guardians...');
        
        try {
            // 全CSVファイルを並行読み込み
            const [
                sceneData,
                characterData,
                dialogueData,
                levelData,
                endingData,
                uiElementData,
                // ... 他のCSVファイル
            ] = await Promise.all([
                this.csvLoader.loadCSV('scenes.csv'),
                this.csvLoader.loadCSV('characters.csv'),
                this.csvLoader.loadCSV('dialogues.csv'),
                this.csvLoader.loadCSV('character_levels.csv'),
                this.csvLoader.loadCSV('endings.csv'),
                this.csvLoader.loadCSV('ui_elements.csv'),
                // ... 他のCSVファイル
            ]);
            
            // データをゲームオブジェクトに変換
            this.processSceneData(sceneData);
            this.processCharacterData(characterData);
            this.processDialogueData(dialogueData);
            // ...
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
    }
    
    processSceneData(data) {
        data.forEach(scene => {
            this.scenes.set(scene.scene_id, {
                name: scene.scene_name,
                background: scene.background_image,
                bgm: scene.bgm_file,
                transition: scene.transition_type,
                duration: parseInt(scene.duration)
            });
        });
    }
    
    // 自動セーブ機能
    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, 5000); // 5秒間隔
    }
    
    saveGame() {
        const saveData = {
            gameState: this.gameState,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem('dreamGuardiansSave', JSON.stringify(saveData));
        console.log('Game auto-saved');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('dreamGuardiansSave');
        if (saveData) {
            const parsed = JSON.parse(saveData);
            this.gameState = parsed.gameState;
            return true;
        }
        return false;
    }
}
```

#### 3. バトルシステム
```javascript
class BattleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentEnemy = null;
        this.playerTurn = true;
        this.battleLog = [];
    }
    
    async startBattle(enemyId) {
        this.currentEnemy = await this.loadEnemyData(enemyId);
        this.initializeBattleUI();
        this.battleLog = [];
        this.addLog('戦闘開始！');
    }
    
    async useMemorySkill(skillId) {
        if (!this.playerTurn) return;
        
        const skill = await this.getSkillData(skillId);
        const damage = this.calculateDamage(skill, this.currentEnemy);
        const emotionEffect = this.calculateEmotionEffect(skill);
        
        // ダメージ適用
        this.currentEnemy.hp -= damage;
        
        // 感情値変化
        Object.keys(emotionEffect).forEach(emotion => {
            this.gameEngine.gameState.playerData[emotion] += emotionEffect[emotion];
        });
        
        this.addLog(`${skill.name_jp}を使用！ ${damage}のダメージ！`);
        
        // 敵の行動
        if (this.currentEnemy.hp > 0) {
            await this.enemyTurn();
        } else {
            this.endBattle(true);
        }
    }
    
    calculateDamage(skill, enemy) {
        let baseDamage = skill.base_power;
        
        // 感情相性による補正
        if (skill.emotion_type === this.getWeaknessEmotion(enemy)) {
            baseDamage *= 1.5; // 弱点攻撃
            this.addLog('効果は抜群だ！');
        } else if (skill.emotion_type === this.getResistEmotion(enemy)) {
            baseDamage *= 0.5; // 耐性
            this.addLog('効果はいまひとつ...');
        }
        
        // レベル補正
        baseDamage *= (1 + this.gameEngine.gameState.playerData.level * 0.1);
        
        return Math.floor(baseDamage + Math.random() * 10);
    }
    
    calculateEmotionEffect(skill) {
        const effects = {};
        
        switch(skill.emotion_type) {
            case 'hope':
                effects.hope = 5;
                effects.despair = -2;
                break;
            case 'empathy':
                effects.empathy = 5;
                effects.loneliness = -2;
                break;
            // ... 他の感情タイプ
        }
        
        return effects;
    }
}
```

#### 4. エンディング判定システム
```javascript
class EndingSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.endingConditions = null;
    }
    
    async initialize() {
        const endingData = await this.gameEngine.csvLoader.loadCSV('endings.csv');
        this.endingConditions = new Map();
        
        endingData.forEach(ending => {
            this.endingConditions.set(ending.ending_id, {
                name_jp: ending.name_jp,
                hope_min: parseInt(ending.hope_min),
                empathy_min: parseInt(ending.empathy_min),
                despair_max: parseInt(ending.despair_max),
                loneliness_max: parseInt(ending.loneliness_max),
                save_rate_min: parseInt(ending.save_rate_min),
                priority: parseInt(ending.priority)
            });
        });
    }
    
    determineEnding() {
        const player = this.gameEngine.gameState.playerData;
        const saveRate = (player.savedCount / this.getTotalBattles()) * 100;
        
        // 優先度順でエンディング判定
        const sortedEndings = Array.from(this.endingConditions.entries())
            .sort((a, b) => a[1].priority - b[1].priority);
        
        for (const [endingId, conditions] of sortedEndings) {
            if (this.checkEndingCondition(player, saveRate, conditions)) {
                return endingId;
            }
        }
        
        return 'end_renewal'; // デフォルトエンディング
    }
    
    checkEndingCondition(player, saveRate, conditions) {
        return (
            player.hope >= conditions.hope_min &&
            player.empathy >= conditions.empathy_min &&
            player.despair <= conditions.despair_max &&
            player.loneliness <= conditions.loneliness_max &&
            saveRate >= conditions.save_rate_min
        );
    }
    
    async displayEnding(endingId) {
        const ending = this.endingConditions.get(endingId);
        
        // エンディング専用背景とBGMを設定
        await this.gameEngine.transitionToScene('ending');
        await this.gameEngine.playBGM(`bgm_${endingId}.mp3`);
        
        // エンディングテキストを表示
        const endingDialogues = await this.getEndingDialogues(endingId);
        await this.gameEngine.playDialogueSequence(endingDialogues);
        
        // 達成率表示
        this.displayAchievementRate(endingId);
        
        // リプレイ促進
        this.showReplayOptions();
    }
}
```

---

## 🎯 想定プレイフロー（15-20分体験）

### 時系列プレイ体験設計

**0:00-2:00 - ゲーム開始とチュートリアル**
1. タイトル画面で世界観に浸る（美しい背景とBGM）
2. 「新しい夢へ」選択で物語開始
3. 主人公とルシードの出会い（世界観説明）
4. 基本操作のチュートリアル

**2:00-5:00 - 最初の記憶体験**
1. 初回戦闘前の会話シーン（感情システム説明）
2. チュートリアル戦闘（絶望の影との戦い）
3. 記憶スキル「幼い日の記憶」の習得
4. 最初の救済成功（希望値+10、救済カウント+1）

**5:00-10:00 - システム習得期**
1. 2回目の戦闘（記憶合成システム導入）
2. キャラクターレベルアップ（外見変化確認）
3. 複雑な感情を持つ敵との戦闘
4. 選択肢による感情値分岐を体験

**10:00-15:00 - 成長実感期**
1. 中級戦闘（より戦略性が必要）
2. 記憶合成による強力スキル作成
3. 主人公の内面的成長を描く会話シーン
4. 重要な選択場面（エンディング分岐に大きく影響）

**15:00-20:00 - クライマックス～エンディング**
1. 最終ボス戦（これまでの成長の集大成）
2. プレイスタイルに応じたエンディング分岐
3. 4種類のうち1つのエンディングを体験
4. 達成率表示とリプレイ促進

### プレイヤーの感情体験設計

**序盤（不安→希望）**
- 初心者としての不安感
- 最初の成功による安堵と達成感
- 新しいシステムへの興味

**中盤（成長→選択）**
- スキルの組み合わせを発見する楽しさ
- キャラクター成長の視覚的満足
- 重要な選択への責任感

**終盤（決断→達成）**
- 最終戦での緊張感
- 自分なりのエンディングへの満足
- 再プレイへの意欲

### リプレイ要素設計

1. **4つのエンディング**: 異なる選択でのプレイ体験
2. **記憶スキル収集**: 隠された組み合わせの発見
3. **完璧救済**: 全ての敵を救うチャレンジ
4. **成長パターン**: 異なる成長ルートでの外見変化確認

---

## 🏆 成功基準・完成度チェックリスト

### ✅ 合格必須条件
- [ ] **必須4画面完備**: タイトル・会話・メインゲーム・エンディング
- [ ] **CSV外部化率100%**: 15個以上のCSVですべて管理
- [ ] **BOM付きUTF-8対応**: 日本語文字化け完全防止
- [ ] **4種類エンディング**: 明確な分岐条件と専用演出

### ✅ 技術実装チェック
- [ ] HTML5/CSS3/JavaScript実装
- [ ] Electron環境対応
- [ ] レスポンシブデザイン
- [ ] LocalStorage自動セーブ
- [ ] CSVファイル動的読み込み
- [ ] アニメーション・エフェクト実装

### ✅ ゲーム体験チェック
- [ ] 15-20分で満足感のある完結
- [ ] 直感的で分かりやすいUI/UX
- [ ] 戦略性のあるバトルシステム
- [ ] キャラクター成長の視覚化
- [ ] リプレイ価値のある要素

### ✅ CSV管理システムチェック
- [ ] 全15個のCSVファイル作成
- [ ] BOM付きUTF-8エンコーディング確認
- [ ] Excel直接開き対応テスト
- [ ] 非プログラマーでも編集可能な構造
- [ ] データ変更の即座反映システム

---

## 🚀 Claude Code実装ガイド

### 実装優先順位
1. **基本構造**: HTML/CSS基盤とCSVローダー
2. **タイトル画面**: UI要素とアニメーション
3. **会話システム**: タイプライター効果と立ち絵表示
4. **バトルシステム**: 感情共鳴メカニクス
5. **成長システム**: レベルアップとキャラクター変化
6. **エンディング**: 分岐システムと専用演出
7. **最適化**: パフォーマンス改善とバグ修正

### 開発時の注意事項
- 全CSVファイルは必ずBOM付きUTF-8で生成
- 画面遷移は必ずフェード効果を含める
- 音声ファイルの非同期読み込み対応
- モバイル端末でのタッチ操作対応
- セーブデータの互換性確保

### 拡張性設計
- 新しいキャラクター追加（CSVに行を追加するだけ）
- 追加スキル実装（memory_skills.csvで管理）
- 新エンディング作成（endings.csvで設定）
- UIテーマ変更（ui_*.csvで完全制御）

---

**📋 この仕様書により、Claude Codeは完全に機能する「夢境の守護者」を実装可能です。**

**🎯 重要**: 全CSVファイルをBOM付きUTF-8で生成し、Excelでの直接編集を保証してください。

**✨ 期待される結果**: プロレベルの品質を持つ、独創的で完成度の高いターン制バトルシミュレーターの完成**