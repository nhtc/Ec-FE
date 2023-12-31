import { Button, Divider, Modal } from 'antd';
import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AppButton from 'src/components/button';
import CourseService from 'src/lib/api/course';
import { CreateOrderArg, OCart } from 'src/lib/types/backend_modal';
import { formatCurrencySymbol } from 'src/lib/utils/currency';
import { GlobalStyle } from 'src/lib/utils/enum';
import RoutePaths from 'src/lib/utils/routes';
import Swal from 'sweetalert2';

import { css } from '@emotion/react';

import { TabSettingKey } from '../settings/tabs';
import CartOrderBill from './cart-order-bill';

interface ChildProps {
  docNum: number;
  children: ReactNode;
  checkoutList: CreateOrderArg;
  cartData: OCart;
}
const PricingCard: React.FC<ChildProps> = ({ docNum, checkoutList, children, cartData }) => {
  const [btnText, setBtnText] = useState<string>('Thanh toán');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const handleCharge = () => {
    setOpenModal(true);
    // AskForSave(
    //   'Thanh toán đơn hàng',
    //   ` Xác nhận đặt đơn hàng trị giá:
    //        <strong><u>${formatCurrencySymbol(checkoutList.total_price, 'VND')} </strong>`,
    //   'Thanh toán',
    //   'Huỷ',
    //   '',
    //   async (value) => {
    //     if (value.isConfirmed) {
    //       try {
    //         const order = CourseService.createOrder(checkoutList);
    //         Swal.fire('Đã đặt đơn thành công!', '', 'success').then((v) => {
    //           if (v.isConfirmed) router.push(`${RoutePaths.SETTINGS}?tab=${TabSettingKey.ORDER}`);
    //         });
    //       } catch (error) {
    //         console.log('error', error);
    //         Swal.fire('Đã có lỗi xảy ra!', 'Xin thử lại sau', 'error');
    //       }
    //     }
    //   },
    // );
  };
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (docNum === 0) {
      setBtnText('Tiếp tục chọn tài liệu');
    } else {
      setBtnText('Thanh toán');
    }
  }, [docNum]);

  const handleOk = async () => {
    try {
      const order = await CourseService.createOrder(checkoutList);
      Swal.fire('Đã đặt đơn thành công!', '', 'success').then((v) => {
        if (v.isConfirmed) router.push(`${RoutePaths.SETTINGS}?tab=${TabSettingKey.ORDER}`);
      });
    } catch (error) {
      Swal.fire('Đã có lỗi xảy ra!', 'Xin thử lại sau', 'error');
      console.log('error', error);
    } finally {
      setOpenModal(false);
    }
  };
  const handleCancel = () => {
    setOpenModal(false);
  };
  return (
    <div
      className="xyz"
      css={css`
        .ant-btn {
          letter-spacing: 0px;
          &:hover {
            letter-spacing: 1px;
          }
        }
        a.ant-btn {
          padding-top: 8px !important;
        }
        .total-price {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
        }

        .ant-statistic {
          text-align: left;
        }
        .total-price {
          font-size: 18px;
          cursor: pointer;
          font-weight: 400;
        }
        .current-price {
          font-family: monospace;
          font-weight: 700;
          font-size: 36px;
          cursor: pointer;
          text-align: left;
          &:hover {
            color: ${GlobalStyle.BROWN_YELLOW};
          }
        }
        .ant-divider {
          margin: 0;
        }
      `}
    >
      {/* <Image src={Img} /> */}
      <div className="total-price">Tổng đơn:</div>
      <Divider />
      <div className="current-price">
        {formatCurrencySymbol(checkoutList.total_price, 'VND', true)}
        {/* {'/'}
				{formatCurrencySymbol(totalPrice, 'VND', true)} */}
        {/* {totalPrice} */}
      </div>
      {/* <Statistic title="Tổng" value={formatCurrency(totalPrice)} /> */}
      <AppButton
        btnTextColor={'black'}
        btnStyle={'outline'}
        btnSize={'small'}
        btnWidth={'full-w'}
        onClick={handleCharge}
        disabled={
          checkoutList?.total_price === 0 &&
          checkoutList?.documents?.length === 0 &&
          checkoutList?.courses?.length === 0
        }
      >
        {btnText}
      </AppButton>
      <Modal
        className="checkout-modal"
        title="Xác nhận thanh toán"
        open={openModal}
        onOk={handleOk}
        // confirmLoading={confirmLoading}
        onCancel={handleCancel}
        css={css`
          min-width: 800px;
          & .ant-modal-body {
            max-height: 700px;
            overflow-y: auto;
            overflow-x: hidden;
          }
          .ant-modal-footer {
            display: flex;
            justify-content: space-between;
          }
          .sum-price {
            font-weight: 700;
            font-size: 20px;
            font-style: italic;
          }
          .ant-modal-title {
            text-align: center;
            font-size: 23px;
            font-weight: 700;
          }
          .ant-btn {
            &:hover {
              background-color: #00aaff;
              color: #000;
              font-weight: 700;
              letter-spacing: 2px;
            }
          }
        `}
        footer={[
          <div key="1" className="sum-price">{`Tổng cộng ${formatCurrencySymbol(
            checkoutList.total_price,
            'VND',
            true,
          )}`}</div>,
          <div key="2" className="right">
            <Button key="3" onClick={handleOk}>
              OK
            </Button>
            <Button key="4" onClick={handleCancel}>
              Cancel
            </Button>
          </div>,
        ]}
      >
        <CartOrderBill checkList={checkoutList} cartData={cartData} totalPrice={checkoutList.total_price} />
      </Modal>
      {/* <Link to="/">
								<div className="btn btn-outline-primary">Continue Shopping</div>
							</Link> */}
    </div>
  );
};

export default PricingCard;
