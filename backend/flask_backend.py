from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

# 回去测
# from transformers import SegformerFeatureExtractor, SegformerForSemanticSegmentation
# from PIL import Image, ImageDraw
# import torch.nn.functional as nf
import random
import numpy as np
# import cv2
import json

# image = Image.open('test_nature_image_00.jpg')
#
# feature_extractor = SegformerFeatureExtractor.from_pretrained('./image-segmentation')
# model = SegformerForSemanticSegmentation.from_pretrained('./image-segmentation')
#
# inputs = feature_extractor(images=image, return_tensors="pt")
# outputs = model(**inputs)
# logits = outputs.logits
#
# # print('wyh-test-05', type(logits), logits.detach().numpy()) # (1, 150, 128, 128)
#
# upsampled_logits = nf.interpolate(
#     logits,
#     size=image.size[::-1],
#     mode='bilinear',
#     align_corners=False
# )
#
# pred_seg = (upsampled_logits.argmax(dim=1)[0]).detach().numpy() # (1280, 1706)
#
# # 计算各个类型mask中的最大内接圆
# label_list = []
# [h, w] = pred_seg.shape
# for i in range(h):
#     for j in range(w):
#         label_index = pred_seg[i][j]
#         if label_index not in label_list:
#             label_list.append(label_index)
#
# anchors = []
# for l in label_list:
#     mask = np.zeros((h, w))
#     for i in range(h):
#         for j in range(w):
#             label_index = pred_seg[i][j]
#             if label_index == l:
#                 mask[i][j] = 255
#     mask = np.uint8(mask)
#
#     # test
#     # mask_l = Image.fromarray(mask).convert('L')
#     # mask_l.save('mask_l.png')
#
#     # 计算到轮廓的距离
#     contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
#
#     # test
#     # print('wyh-test-01', type(contours), len(contours)) # 2
#     # temp = np.ones(mask.shape, np.uint8) * 255
#     # cv2.drawContours(temp, contours, -1, (0, 255, 0), 3)
#     # cv2.imshow("contours", temp)
#     # cv2.waitKey(0)
#     # cv2.destroyAllWindows()
#
#     anchor_pts = []
#     for k in range(len(contours)):
#         # 计算到轮廓的距离
#         raw_dist = np.empty((h, w), dtype=np.float32)
#         for i in range(h):
#             for j in range(w):
#                 raw_dist[i, j] = cv2.pointPolygonTest(contours[k], (j, i), True)
#
#         # 获取最大值即内接圆半径，中心点坐标
#         _, maxVal, _, maxDistPt = cv2.minMaxLoc(raw_dist)
#         maxVal = abs(maxVal)
#         anchor_pts.append({
#             'center': maxDistPt,
#             'radius': maxVal
#         })
#     max_radius_pt = anchor_pts[0]
#     for k in range(1, len(anchor_pts)):
#         if anchor_pts[k]['radius'] > max_radius_pt['radius']:
#             max_radius_pt = anchor_pts[k]
#     # print(max_radius_pt)
#     anchors.append(max_radius_pt)
#     # break
#
# # test - blend
# layer_back = image.convert('RGBA')
# layer_font = Image.open('flash.png', ).convert('RGBA')
# _, _, _, a = layer_font.split()
# flash_r = ((layer_font.size)[0]) / 2
# print('flash', flash_r)
# for i in range(len(anchors)):
#     anchor_c = anchors[i]['center']
#     layer_back.paste(layer_font, (
#         round(anchor_c[0] - flash_r),
#         round(anchor_c[1] - flash_r)
#     ), mask=a)
#
# layer_back.save('image_blend.png')

# test
# print(type(pred_seg), pred_seg.detach().numpy())
# palette = [random.randint(0, 255) for x in range(256 * 3)]
# mask_image = Image.fromarray(pred_seg.astype(np.uint8), 'P')
# mask_image.putpalette(palette)

# test
# image_draw = ImageDraw.Draw(mask_image)
# for i in range(len(anchors)):
#     anchor_c = anchors[i]['center']
#     anchor_r = anchors[i]['radius']
#     image_draw.ellipse(
#         ((anchor_c[0] - anchor_r, anchor_c[1] - anchor_r),
#         (anchor_c[0] + anchor_r, anchor_c[1] + anchor_r)),
#         fill=None,
#         outline='red',
#         width=5
#     )
#
# mask_image.save('mask_anchor.png')

# test
# check bboxes - previous
# bboxes = list((bboxes.detach().numpy())[0])
# img_bboxes = ImageDraw.ImageDraw(image)
# img_size = image.size # 1706 1280
# for i in range(len(bboxes)):
#     img_bboxes.rectangle(
#         (bboxes[i][2] * img_size[0], bboxes[i][3] * img_size[1],
#          bboxes[i][0] * img_size[0], bboxes[i][1] * img_size[1]),
#         fill=None,
#         outline='red',
#         width=3
#     )
#
# image.save('result.jpg')


@app.route("/hello", methods=["get"])
def hello():
    return "hello world"

# @app.route("/image_segmentation", methods=["post"])
# def image_segmentation():
#     print('enter-flask')
#     files = request.files.to_dict()
#     image = cv2.imdecode(np.asarray(bytearray(files['img'].read()), dtype='uint8'), cv2.IMREAD_COLOR)
#     image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
#
#     feature_extractor = SegformerFeatureExtractor.from_pretrained('./image-segmentation')
#     model = SegformerForSemanticSegmentation.from_pretrained('./image-segmentation')
#
#     inputs = feature_extractor(images=image, return_tensors="pt")
#     outputs = model(**inputs)
#     logits = outputs.logits
#
#     upsampled_logits = nf.interpolate(
#         logits,
#         size=image.size[::-1],
#         mode='bilinear',
#         align_corners=False
#     )
#
#     pred_seg = (upsampled_logits.argmax(dim=1)[0]).detach().numpy() # (1280, 1706)
#
#     # 计算各个类型mask中的最大内接圆
#     label_list = []
#     [h, w] = pred_seg.shape
#     for i in range(h):
#         for j in range(w):
#             label_index = pred_seg[i][j]
#             if label_index not in label_list:
#                 label_list.append(label_index)
#
#     anchors = []
#     for l in label_list:
#         mask = np.zeros((h, w))
#         for i in range(h):
#             for j in range(w):
#                 label_index = pred_seg[i][j]
#                 if label_index == l:
#                     mask[i][j] = 255
#         mask = np.uint8(mask)
#
#         # 计算到轮廓的距离
#         contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
#
#         anchor_pts = []
#         for k in range(len(contours)):
#             # 计算到轮廓的距离
#             raw_dist = np.empty((h, w), dtype=np.float32)
#             for i in range(h):
#                 for j in range(w):
#                     raw_dist[i, j] = cv2.pointPolygonTest(contours[k], (j, i), True)
#
#             # 获取最大值即内接圆半径，中心点坐标
#             _, maxVal, _, maxDistPt = cv2.minMaxLoc(raw_dist)
#             maxVal = abs(maxVal)
#             anchor_pts.append({
#                 'center': maxDistPt,
#                 'radius': maxVal
#             })
#         max_radius_pt = anchor_pts[0]
#         for k in range(1, len(anchor_pts)):
#             if anchor_pts[k]['radius'] > max_radius_pt['radius']:
#                 max_radius_pt = anchor_pts[k]
#         anchors.append(max_radius_pt)
#
#     # test
#     # palette = [random.randint(0, 255) for x in range(256 * 3)]
#     # mask_image = Image.fromarray(pred_seg.astype(np.uint8), 'P')
#     # mask_image.putpalette(palette)
#     # image_draw = ImageDraw.Draw(mask_image)
#     # for i in range(len(anchors)):
#     #     anchor_c = anchors[i]['center']
#     #     anchor_r = anchors[i]['radius']
#     #     image_draw.ellipse(
#     #         ((anchor_c[0] - anchor_r, anchor_c[1] - anchor_r),
#     #         (anchor_c[0] + anchor_r, anchor_c[1] + anchor_r)),
#     #         fill=None,
#     #         outline='red',
#     #         width=5
#     #     )
#     #
#     # mask_image.save('mask_anchor_frontend.png')
#
#     return json.dumps({
#         'anchors': anchors
#     })


if __name__ == "__main__":
    app.run(debug=True, port=8080)
