document.addEventListener("DOMContentLoaded", function() {
    const counters = document.querySelectorAll('.r-number');
    const registerCountSection = document.querySelector('.register-count');
    let hasCounted = false;

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function startCounting() {
        if (!hasCounted && isInViewport(registerCountSection)) { 
            counters.forEach(counter => {
                const target = parseInt(counter.innerText.replace(/[^0-9]/g, ''), 10);
                counter.innerText = 0; 
                counter.dataset.count = target; 

                const updateCount = () => {
                    const count = +counter.innerText; 
                    const increment = Math.ceil(target / 100); 
                    if (count < target) {
                        counter.innerText = Math.min(count + increment, target); 
                        setTimeout(updateCount, 30); 
                    } else {
                        counter.innerText = target; 
                        if (counter.parentElement.classList.contains('hours') || counter.parentElement.classList.contains('participants')) {
                            counter.innerText += '+'; 
                        }
                    }
                };
                
                updateCount(); 
            });
            hasCounted = true;
        }
    }

    window.addEventListener('scroll', startCounting);
});