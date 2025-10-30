import { Stack } from '@mui/material';
import SaleInfo from './SaleInfo';

type SaleInfoItem = {
  id: number;
  image: string;
  title: string;
  sales: number | string;
  increment: number;
  date: string;
};

const SaleInfoCards = ({ data }: { data: SaleInfoItem[] }) => {
  return (
    <Stack direction={{ sm: 'row' }} justifyContent={{ sm: 'space-between' }} gap={3.75}>
      {data.map((saleInfoDataItem) => (
        <SaleInfo
          key={saleInfoDataItem.id}
          title={saleInfoDataItem.title}
          image={saleInfoDataItem.image}
          sales={saleInfoDataItem.sales}
          increment={saleInfoDataItem.increment}
          date={saleInfoDataItem.date}
        />
      ))}
    </Stack>
  );
};

export default SaleInfoCards;
