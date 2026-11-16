try{const t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"}catch{}
