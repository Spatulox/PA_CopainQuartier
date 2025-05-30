export function popup(message: string){
    const pop = document.getElementById("popup-slide")
    if(pop){
        pop.classList.remove("active")
        pop.textContent = message
        pop.classList.add("active")
    }

    const minTime = 1500; // 1,5 secondes minimum
    const maxTime = 20000; // 10 secondes maximum
    const timePerChar = 100; // 100 ms par caractère

    const timeToWait = Math.min(
        Math.max(message.length * timePerChar, minTime),
        maxTime
    );

    setTimeout(() => {
        pop?.classList.remove("active")
    }, timeToWait);
}