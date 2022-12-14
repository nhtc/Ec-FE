import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SettingTabs from 'src/components/settings/tabs';
import Layout from 'src/components/common/Layout';
import { RootState } from 'src/lib/reducers/model';
const SettingsUI: React.FC = () => {
  return (
    <>
      <SettingTabs />
    </>
  );
};

const SettingsSection: React.FC = () => {
  const userType = useSelector((state: RootState) => state.app.user);
  useEffect(() => {
    console.log('userType :>> ', userType);
  }, []);

  return (
    <div>
      <Layout>
        <SettingsUI />
      </Layout>
    </div>
  );
};

export default SettingsSection;
