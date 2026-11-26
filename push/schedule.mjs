const DAY = 86400000;
export const dayAt = (ms) => new Date(ms + 3 * 3600000).toISOString().slice(0,10);
const at = (day,hour) => Date.parse(day + 'T' + String(hour).padStart(2,'0') + ':00:00+03:00');
export const shiftDay = (day,n) => dayAt(at(day,12) + n * DAY);

export function nextEvent(plan, after) {
  const today = dayAt(after);
  const candidates = [];
  const add = (kind, date, hour) => {
    const time = at(date, hour);
    if (time > after) candidates.push({kind, time, day:date});
  };
  if (plan.daily) {
    for (let n = 0; n < 9; n++) {
      const date = shiftDay(today,n);
      if (!plan.days.includes(date) && at(date,21) > after) { add('daily', date,21); break; }
    }
  }
  if (plan.weekly) {
    const weekday = new Date(today + 'T12:00:00Z').getUTCDay();
    let sunday = shiftDay(today, (7-weekday)%7);
    if (at(sunday,20) <= after) sunday = shiftDay(sunday,7);
    add('weekly',sunday,20);
  }
  if (plan.due) {
    for (const date of plan.dates) {
      const prior = shiftDay(date,-1);
      if (at(prior,10) > after) { add('due',prior,10); break; }
    }
  }
  if (plan.complete && plan.finished > after) candidates.push({kind:'complete', time:plan.finished, day:dayAt(plan.finished)});
  return candidates.sort((a,b) => a.time - b.time)[0];
}

export function notification(plan, event) {
  const count = plan.days.filter(d => d >= shiftDay(event.day,-6) && d <= event.day).length;
  const bodies = {
    daily: 'Bugünkü harcamalarını ekle veya harcama yapmadığını işaretle.',
    due: 'Yarın vadesi gelen ödemen var. Ödeme takvimini kontrol et.',
    weekly: 'Son 7 günün ' + count + ' gününde harcamanı veya harcamasız gününü kaydettin.',
    complete: 'Bir taksit planını tamamladın. Tebrikler!'
  };
  return {body: plan.private ? 'Kese’de yeni bir bildirimin var.' : bodies[event.kind], kind:event.kind, tag:event.kind + '-' + event.day};
}
