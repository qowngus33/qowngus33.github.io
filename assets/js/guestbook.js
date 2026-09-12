// Public API key only. Never put a secret/service_role key in this file.
window.journeyGuestbook = (() => {
  const url = 'https://sqbgklhvezsjdyjefqaj.supabase.co';
  const key = 'sb_publishable_Q9QFAsoz0jD9eJVSfA7CjQ_ha1wgWcL';
  async function rpc(name, body = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
        method:'POST', headers:{apikey:key, 'Content-Type':'application/json'},
        body:JSON.stringify(body), signal:controller.signal
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'REQUEST_FAILED');
      return data;
    } finally { clearTimeout(timer); }
  }
  function errorMessage(error) {
    const message = error?.message || '';
    if (message.includes('PLEASE_WAIT')) return 'Please wait 10 seconds and try again.';
    if (message.includes('DAILY_LIMIT')) return 'The guestbook has reached its daily limit. Please try tomorrow.';
    if (message.includes('INVALID_ENTRY')) return 'Please check your nickname, message, and score.';
    return 'Could not connect to the guestbook. Please try again later. Your game progress is safe.';
  }
  return {
    list:()=>rpc('journey_list_entries'),
    submit:entry=>rpc('journey_submit_entry',entry),
    errorMessage
  };
})();
