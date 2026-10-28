'use client';
import {useRef} from 'react';
export default function HowToPlay(){const dialog=useRef<HTMLDialogElement>(null);return <>
 <button className="fullscreen-toggle" onClick={()=>{dialog.current?.showModal();if(dialog.current)dialog.current.scrollTop=0;}}>How to play</button>
 <dialog ref={dialog} className="play-guide"><h2>How to play</h2>
 <p>Chase your rival, jump between platforms, and land your attacks. Knock their health to zero to win. There is no time limit. If both fighters are knocked out together, it’s a tie.</p>
 <h3>On a keyboard</h3><p><strong>A / D or ← / →</strong> run · <strong>Space / ↑</strong> jump · <strong>J</strong> punch · <strong>K</strong> high kick · <strong>L</strong> sweep. Hold move + punch for a running punch. Jump over sweeps and through platforms to land on top.</p>
 <h3>On a phone</h3><p>Turn sideways. Drag the left stick to run, tilt up to jump, or tilt diagonally to run and jump. Use the circular attack buttons on the right.</p>
 <h3>Need a break?</h3><p>Press Pause to freeze the game for everyone. Only the player who paused can press Play to resume.</p>
 <h3>A little help</h3><p>The flying cat appears when someone has 25% health or less. Chase it through three escapes, then touch it when it says “TOUCH TO HEAL” for +40 HP.</p>
 <h3>Choose your mode</h3><p><strong>Solo:</strong> beat three opponents from Easy to Hard. <strong>With a friend:</strong> create a room and share its code. Each duel ends with a knockout. Afterward, both players choose “Next arena” to start a new round in the next Tokyo setting.</p>
 <form method="dialog"><button className="primary">Back to the game</button></form></dialog></>;}
