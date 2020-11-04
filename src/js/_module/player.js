import { Player } from "textalive-app-api";

export function player() {
  // body
  const body = document.querySelector('#app');
  // Youtube　URL
  const song = 'https://www.youtube.com/watch?v=ygY2qObZv24';
  // media block
  const media = document.querySelector('#media');
  // beat block
  const beatWrap = document.querySelector('#beat');
  const beatCircle = beatWrap.querySelector('.c-beat-circle');
  // lyric block
  const textWrap =       document.querySelector("#text");
  const nextText =       document.querySelector("#text-next");

  // 歌詞を切り替え
  const lyricObserver = () => {
    const target = textWrap;

    // オブザーバインスタンスを作成
    const observer = new MutationObserver(() => {
      const text = textWrap.querySelector('.c-text__text');

      requestAnimationFrame(() => {
        setTimeout(() => {
          text.classList.add('is-active');
        }, 0)
      });
    });

    // オブザーバの設定
    const config = {
      attributes: true,
      childList: true,
      characterData: true
    };

    // 対象ノードとオブザーバの設定を渡す
    observer.observe(target, config);
  }

  // 表示切り替え用オブザーバー実行
  lyricObserver();

  // TextAlive Player
  const player = new Player({
    app: true,
    mediaElement: media
  });

  let wordMemo;
  let phraseMemo;

  // 単語が発声されていたら表示する
  const animateWord = function (now, unit) {
    if (unit.contains(now)) {
      // 歌詞を取得（word）
      // let word = unit.text;
      // 歌詞を取得（phrase）
      let word = unit._parent.text;
      if (wordMemo !== word) {
        wordMemo = word;
        textWrap.innerHTML = `<p class="c-text__text"><span class="c-text__inner">${word}</span></p>`;
      }

      let phraseWord = unit.next._parent.text;
      if (phraseMemo !== phraseWord) {
        phraseMemo = phraseWord;
        nextText.innerText = phraseWord;
      }
    }
  };

  player.addListener({
    // 実行の準備が整ったとき
    onAppReady(app) {
      if (app.managed) {
        document.querySelector("#control").className = "disabled";
      }
      if (!app.songUrl) {
        player.createFromSongUrl(song);
      }
    },
    onVideoReady: () => {
      // 動画の読み込み開始
      let w = player.video.firstWord;
      while (w) {
        w.animate = animateWord;
        w = w.next;
      }
    },
    onTimerReady: () => {
      // 動画の再生準備ができたとき
      body.setAttribute('data-load', 'true');

      // タイトルを表示
      const title = document.querySelector('.c-text__song');
      title.innerText = player.data.song.name;

      nextText.innerText = player.video.firstPhrase;

      // 再生ボタン
      const buttonPlay = document.querySelector('#play').addEventListener('click', e => {
        e.preventDefault();

        if(player.isPlaying) {
          player.requestPause();
        } else {
          player.requestPlay();
        }
      })
    },
    onThrottledTimeUpdate: (position) => {
      // 再生中に0.1秒単位で実行
      const time = Math.floor(position / 100);
      // body.setAttribute('data-time', `time${time}`);

      const beat = player.getBeats().length;

      if(Number(time) > 60) {
        if(beat) {
          requestAnimationFrame(() => {
            beatCircle.classList.remove('is-beat');
            setTimeout(() => {
              beatCircle.classList.add('is-beat');
            }, 0)
          });
        }
      }
    },
    onPlay: () => {
      // 再生したとき
      media.classList.add('is-active')
      media.classList.add('is-play');
      body.setAttribute('data-play', 'true')
    },
    onPause: () => {
      // 一時停止したとき
      body.setAttribute('data-play', 'false')
      media.classList.remove('is-play');
    }
  });
}
