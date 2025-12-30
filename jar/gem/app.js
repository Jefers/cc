/**
 * Jars - Mobile Money App
 * A vanilla JS production-ready architecture
 */

const Store = {
    get() {
        const defaults = {
            jars: [
                { id: 'bills', name: 'Bills', amount: 0, locked: true },
                { id: 'everyday', name: 'Everyday', amount: 0, locked: true },
                { id: 'savings', name: 'Savings', amount: 0, locked: false }
            ],
            movements: [],
            bills: [],
            currentMonth: new Date().getMonth()
        };
        const data = localStorage.getItem('jars_data');
        return data ? JSON.parse(data) : defaults;
    },
    save(data) {
        localStorage.setItem('jars_data', JSON.stringify(data));
    }
};

const app = {
    state: Store.get(),

    init() {
        this.checkMonthReset();
        this.navigate('home');
        this.updateNavIndicator();
    },

    checkMonthReset() {
        const now = new Date().getMonth();
        if (this.state.currentMonth !== now) {
            this.state.currentMonth = now;
            this.state.bills.forEach(b => b.paid = false);
            this.save();
        }
    },

    save() {
        Store.save(this.state);
    },

    navigate(screen, params = {}) {
        const container = document.getElementById('screen-container');
        container.style.opacity = 0;
        
        setTimeout(() => {
            container.innerHTML = this.render(screen, params);
            container.style.opacity = 1;
            
            // Update Nav State
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.toggle('active', el.dataset.screen === screen);
            });
            this.updateNavIndicator();
        }, 150);
    },

    updateNavIndicator() {
        const active = document.querySelector('.nav-item.active');
        const indicator = document.querySelector('.nav-indicator');
        if (active && indicator) {
            indicator.style.left = `${active.offsetLeft + active.offsetWidth/2 - 2}px`;
        }
    },

    render(screen, params) {
        switch(screen) {
            case 'home': return this.screens.home();
            case 'add': return this.screens.add();
            case 'spend': return this.screens.spend();
            case 'bills': return this.screens.bills();
            case 'jar-detail': return this.screens.jarDetail(params.id);
            case 'add-bill': return this.screens.addBill();
            default: return '';
        }
    },

    screens: {
        home() {
            const total = app.state.jars.reduce((sum, j) => sum + j.amount, 0);
            const billTotal = app.state.bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0);
            const statusMsg = app.state.jars.find(j => j.id === 'bills').amount >= billTotal 
                ? "Bills look covered 👍" 
                : "Let's keep an eye on things.";

            return `
                <div class="fade-in">
                    <p class="status-msg">☀️ This month</p>
                    <h1 class="large-num">${total}</h1>
                    <p class="status-msg" style="margin-bottom: 32px">You have ${total}</p>
                    
                    <div class="jar-list">
                        ${app.state.jars.map(jar => `
                            <div class="jar-card" onclick="app.navigate('jar-detail', {id: '${jar.id}'})">
                                <div class="jar-info">
                                    <h3>${jar.name}</h3>
                                    <div class="jar-amount">${jar.amount}</div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                        `).join('')}
                    </div>
                    <p class="status-msg" style="text-align: center; margin-top: 40px">${statusMsg}</p>
                </div>
            `;
        },

        add() {
            return `
                <div class="fade-in">
                    <h1>Money came in</h1>
                    <input type="number" id="add-amount" class="amount-input-large" placeholder="0" inputmode="decimal">
                    
                    <div class="input-group">
                        <label class="input-label">Where did it go?</label>
                        <select id="add-jar">
                            ${app.state.jars.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="input-group">
                        <label class="input-label">Where did it come from?</label>
                        <input type="text" id="add-desc" placeholder="Salary, Gift, etc.">
                    </div>

                    <button class="btn" onclick="app.actions.addMoney()">Add money</button>
                </div>
            `;
        },

        spend() {
            return `
                <div class="fade-in">
                    <h1>Money went out</h1>
                    <input type="number" id="spend-amount" class="amount-input-large" placeholder="0" inputmode="decimal">
                    
                    <div class="input-group">
                        <label class="input-label">What was it for?</label>
                        <input type="text" id="spend-desc" placeholder="Groceries, Coffee, etc.">
                    </div>

                    <div class="input-group">
                        <label class="input-label">Which jar?</label>
                        <select id="spend-jar">
                            ${app.state.jars.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
                        </select>
                    </div>

                    <button class="btn" onclick="app.actions.spendMoney()">Done</button>
                </div>
            `;
        },

        bills() {
            const paid = app.state.bills.filter(b => b.paid);
            const upcoming = app.state.bills.filter(b => !b.paid);

            return `
                <div class="fade-in">
                    <h1>Bills this month</h1>
                    
                    <section style="margin-top: 24px">
                        <h3 class="input-label">Coming up</h3>
                        <div class="jar-card" style="display:block; padding: 0">
                            ${upcoming.length ? upcoming.map(b => `
                                <div class="bill-item" onclick="app.actions.payBill('${b.id}')">
                                    <span>${b.name} (Day ${b.day})</span>
                                    <strong>${b.amount || 'Variable'}</strong>
                                </div>
                            `).join('') : '<p style="padding: 20px; color: var(--text-soft)">All clear!</p>'}
                        </div>
                    </section>

                    <section style="margin-top: 24px">
                        <h3 class="input-label">Paid</h3>
                        <div class="jar-card" style="display:block; padding: 0; opacity: 0.6">
                            ${paid.map(b => `
                                <div class="bill-item">
                                    <span>${b.name}</span>
                                    <strong>${b.amount}</strong>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <button class="btn btn-secondary" onclick="app.navigate('add-bill')">Add a bill</button>
                </div>
            `;
        },

        addBill() {
            return `
                <div class="fade-in">
                    <h1>New Bill</h1>
                    <div class="input-group">
                        <label class="input-label">What is it?</label>
                        <input type="text" id="bill-name" placeholder="Rent, Internet...">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Amount</label>
                        <input type="number" id="bill-amount" placeholder="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Due day (1-31)</label>
                        <input type="number" id="bill-day" placeholder="1">
                    </div>
                    <button class="btn" onclick="app.actions.saveBill()">Save Bill</button>
                </div>
            `;
        },

        jarDetail(id) {
            const jar = app.state.jars.find(j => j.id === id);
            const moves = app.state.movements.filter(m => m.jarId === id).reverse();
            return `
                <div class="fade-in">
                    <button class="btn-secondary" style="width: auto; padding: 8px 16px; margin-bottom: 20px" onclick="app.navigate('home')">← Back</button>
                    <h1>${jar.name}</h1>
                    <p class="large-num">${jar.amount}</p>
                    <p class="status-msg" style="margin-bottom: 32px">You have ${jar.amount}</p>
                    
                    <h3 class="input-label">Recent Activity</h3>
                    <div class="jar-card" style="display:block; padding: 0">
                        ${moves.slice(0, 10).map(m => `
                            <div class="bill-item">
                                <span>${m.description || (m.direction === 'in' ? 'Money in' : 'Money out')}</span>
                                <strong style="color: ${m.direction === 'in' ? '#27ae60' : 'var(--text)'}">${m.direction === 'in' ? '+' : '-'}${m.amount}</strong>
                            </div>
                        `).join('') || '<p style="padding: 20px">No activity yet</p>'}
                    </div>
                </div>
            `;
        }
    },

    actions: {
        addMoney() {
            const amt = parseFloat(document.getElementById('add-amount').value);
            const jarId = document.getElementById('add-jar').value;
            const desc = document.getElementById('add-desc').value;

            if (!amt) return app.toast("Nothing changed.");

            const jar = app.state.jars.find(j => j.id === jarId);
            jar.amount += amt;
            app.state.movements.push({
                id: Date.now(),
                amount: amt,
                direction: 'in',
                jarId: jarId,
                description: desc,
                date: new Date()
            });

            app.save();
            app.celebrate();
            app.toast("Money added 👍");
            app.navigate('home');
        },

        spendMoney() {
            const amt = parseFloat(document.getElementById('spend-amount').value);
            const jarId = document.getElementById('spend-jar').value;
            const desc = document.getElementById('spend-desc').value;

            if (!amt) return app.toast("Nothing changed.");

            const jar = app.state.jars.find(j => j.id === jarId);
            jar.amount -= amt;
            app.state.movements.push({
                id: Date.now(),
                amount: amt,
                direction: 'out',
                jarId: jarId,
                description: desc,
                date: new Date()
            });

            app.save();
            app.toast("Done");
            app.navigate('home');
        },

        saveBill() {
            const name = document.getElementById('bill-name').value;
            const amt = parseFloat(document.getElementById('bill-amount').value) || 0;
            const day = parseInt(document.getElementById('bill-day').value) || 1;

            if (!name) return;

            app.state.bills.push({
                id: Date.now().toString(),
                name,
                amount: amt,
                day,
                paid: false
            });

            app.save();
            app.toast("Bill added");
            app.navigate('bills');
        },

        payBill(id) {
            const bill = app.state.bills.find(b => b.id === id);
            let payAmt = bill.amount;

            if (payAmt === 0) {
                const input = prompt("How much was the bill?");
                payAmt = parseFloat(input);
            }

            if (!payAmt) return;

            const jar = app.state.jars.find(j => j.id === 'bills');
            jar.amount -= payAmt;
            bill.paid = true;
            bill.lastAmount = payAmt;

            app.state.movements.push({
                id: Date.now(),
                amount: payAmt,
                direction: 'out',
                jarId: 'bills',
                description: `Bill: ${bill.name}`,
                date: new Date()
            });

            app.save();
            app.toast("Bill marked as paid");
            app.navigate('bills');
        }
    },

    toast(msg) {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 400);
        }, 2500);
    },

    celebrate() {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 8 + 4;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.background = `hsl(${Math.random() * 360}, 50%, 70%)`;
            p.style.left = '50%';
            p.style.top = '50%';
            
            document.body.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 10 + 5;
            let x = 0, y = 0;
            
            const animate = () => {
                x += Math.cos(angle) * velocity;
                y += Math.sin(angle) * velocity;
                p.style.transform = `translate(${x}px, ${y}px)`;
                p.style.opacity = parseFloat(p.style.opacity || 1) - 0.02;
                
                if (parseFloat(p.style.opacity) > 0) requestAnimationFrame(animate);
                else p.remove();
            };
            requestAnimationFrame(animate);
        }
    }
};

window.onload = () => app.init();