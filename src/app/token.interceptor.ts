import { HttpInterceptorFn } from '@angular/common/http'
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  req = req.clone(
    { withCredentials: true }
  )
  return next(req)
}
