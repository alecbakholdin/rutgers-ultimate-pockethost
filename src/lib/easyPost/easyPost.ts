import { EASYPOST_API_KEY } from '$env/static/private'
import EasyPost from '@easypost/api'

export const easyPost = new EasyPost(EASYPOST_API_KEY);