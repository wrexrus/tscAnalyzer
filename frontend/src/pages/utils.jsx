import { toast } from 'react-toastify';

export const handleSuccess = (msg)=>{
    toast.success(msg, {
        position: 'top-right'
    })
}

export function parseJwt(token){
  if(!token) return null;
  try{
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  }catch{
    return null;
  }
}

export function isExpired(token){
  const p = parseJwt(token);
  if(!p || !p.exp) return true;
  return Date.now() >= p.exp * 1000;
}

export const handleError = (msg)=>{
    toast.error(msg, {
        position: 'top-right'
    })
}