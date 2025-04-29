'use client';
import { FC } from 'react';
import { IsochronesParamsProvider } from './IsochronesParamsContext';
import IsochronesParamsForm from './IsochronesParamsForm';
import IsochronesMap from './IsochronesMap';

const IsochronesMapExample: FC = () => {
  return (
    <IsochronesParamsProvider>
      <div className="box-border flex h-[800px] flex-col items-center space-y-4">
        <IsochronesParamsForm />
        <div className="h-full w-full">
          <IsochronesMap />
        </div>
      </div>
    </IsochronesParamsProvider>
  );
};

export default IsochronesMapExample;
