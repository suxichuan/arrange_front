import request from '@/utils/request'

export function getList(current_page, page_size, key_place_name, key_place_code) {
  // return request({
  //   url: '/place/list',
  //   method: 'get',
  //   data: {
  //     'current_page': current_page,
  //     'page_size': page_size,
  //     'key_place_name': key_place_name,
  //     'key_place_code': key_place_code
  //   }
  // })
}

export function delete_place(params) {
  console.log(params)
  return request({
    url: '/place/delete',
    method: 'get',
    params
  })
}

