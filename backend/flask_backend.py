from flask import Flask

app = Flask(__name__)

# from transformers import SegformerFeatureExtractor, SegformerForSemanticSegmentation
# from PIL import Image, ImageDraw
# import torch.nn.functional as nf
# import random
# import numpy as np
# import cv2
#
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
# # test
# # print(type(pred_seg), pred_seg.detach().numpy())
# # palette = [random.randint(0, 255) for x in range(256 * 3)]
# # mask_image = Image.fromarray(pred_seg.astype(np.uint8), 'P')
# # mask_image.putpalette(palette)
#
# # test
# # image_draw = ImageDraw.Draw(mask_image)
# # for i in range(len(anchors)):
# #     anchor_c = anchors[i]['center']
# #     anchor_r = anchors[i]['radius']
# #     image_draw.ellipse(
# #         ((anchor_c[0] - anchor_r, anchor_c[1] - anchor_r),
# #         (anchor_c[0] + anchor_r, anchor_c[1] + anchor_r)),
# #         fill=None,
# #         outline='red',
# #         width=5
# #     )
# #
# # mask_image.save('mask_anchor.png')
#
# # test
# # check bboxes - previous
# # bboxes = list((bboxes.detach().numpy())[0])
# # img_bboxes = ImageDraw.ImageDraw(image)
# # img_size = image.size # 1706 1280
# # for i in range(len(bboxes)):
# #     img_bboxes.rectangle(
# #         (bboxes[i][2] * img_size[0], bboxes[i][3] * img_size[1],
# #          bboxes[i][0] * img_size[0], bboxes[i][1] * img_size[1]),
# #         fill=None,
# #         outline='red',
# #         width=3
# #     )
# #
# # image.save('result.jpg')

if __name__ =="__main__":
    app.run(debug=True, port=8080)
