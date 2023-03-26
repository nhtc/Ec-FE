import { Image } from 'antd';
import Logo from 'src/assets/images/logo.png';
import BannerImg from 'src/assets/images/app-banner.png';
import styled from '@emotion/styled';
import Link from 'next/link';
import RoutePaths from 'src/lib/utils/routes';

const BannerWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-right: calc(var(--bs-gutter-x) * 1);
  padding-left: calc(var(--bs-gutter-x) * 1);
  padding-top: 20px;
  padding-bottom: 20px;
  border-radius: 5px;
  --bs-gutter-x: 5rem;
  --bs-gutter-y: 0;
  .app-logo,
  .app-banner {
    height: 100px;
  }
  .app-banner {
    height: 100px;
  }
`;

const Banner = () => {
  return (
    <BannerWrapper>
      <div className="app-logo">
        <Link href={RoutePaths.HOME}>
          <Image src={Logo.src} preview={false} height={100} />
        </Link>
      </div>
      <div className="app-banner">
        <Image src={BannerImg.src} preview={false} height={100} />
      </div>
    </BannerWrapper>
  );
};
export default Banner;
