async function run() {
    let missing = 1;
    while(missing > 0) {
        console.log("Pinging endpoint...");
        try {
            const res = await fetch('http://localhost:3000/api/trigger-fill-missing', { method: 'POST' });
            const data = await res.json();
            console.log(data);
            missing = data.missing_left;
            if (data.processed === 0 && missing > 0) {
                console.log("No progress, wait and try again");
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (e) {
            console.log(e);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}
run();
