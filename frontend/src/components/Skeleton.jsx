import React from 'react';
import { cn } from '../lib/utils';
export const Skeleton = ({ className }) => {
    return (<div className={cn("animate-pulse bg-slate-200 rounded-xl", className)}/>);
};
export const ProductSkeleton = () => {
    return (<div className="bg-white rounded-3xl p-4 space-y-4 border border-slate-100 shadow-sm">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl"/>
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3"/>
        <Skeleton className="h-3 w-1/3"/>
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4"/>
        <Skeleton className="h-10 w-10 rounded-xl"/>
      </div>
    </div>);
};
