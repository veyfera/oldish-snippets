WITH [PrevPurchases] AS 
	(SELECT [LoyaltyProgramSales].[Period] AS [Period],
		 [LoyaltyProgramSales].[AccountID] AS [AccountID],
		 CAST(lag([LoyaltyProgramSales].[Period])
		OVER (PARTITION BY [LoyaltyProgramSales].[AccountID]
	ORDER BY  [LoyaltyProgramSales].[Period]) AS DATETIME) AS prev_period, datediff(d, lag([LoyaltyProgramSales].[Period])
		OVER (PARTITION BY [LoyaltyProgramSales].[AccountID]
	ORDER BY  [LoyaltyProgramSales].[Period]), [LoyaltyProgramSales].[Period]) AS days_since_prev_purchase
	FROM [LoyaltyProgramSales]
	WHERE [LoyaltyProgramSales].[Amount] >= 0
	GROUP BY  [LoyaltyProgramSales].[AccountID], [LoyaltyProgramSales].[Period])
SELECT TOP 1 [LoyaltyProgramSales].[ModifiedDate],
		 sum([LoyaltyProgramSales].[Amount])
	OVER (PARTITION BY [Store].[Code], [Store_1].[Code], [LoyaltyProgramSales].[Period], [LoyaltyProgramSales].[IDSale]) AS amount, CAST(dateadd(s, 43200 + checksum([LoyaltyProgramSales].[IDSale]) % 43200, dateadd(d, datediff(d, 0, [LoyaltyProgramSales].[Period]), 0)) AS DATETIME) AS ts, 0 AS discount, isnull([Employee].[Name], '') AS cashier, ltrim(rtrim([LoyaltyProgramSales].[IDSale])) AS ext_id, CAST([Store_1].[Code] AS VARCHAR(max)) + '-' + CAST([Store].[Code] AS VARCHAR(max)) AS store_ext_id, [PrevPurchases].prev_period, [PrevPurchases].days_since_prev_purchase,
	CASE
	WHEN ([Account].[StatusLP] IN (15, 16)) THEN
	1
	ELSE 0
	END AS is_installer, sum([LoyaltyProgramSales].[ProfitZP])
	OVER (PARTITION BY [Store].[Code], [Store_1].[Code], [LoyaltyProgramSales].[Period], [LoyaltyProgramSales].[IDSale]) AS profit,
	CASE
	WHEN ([LoyaltyProgramSales].[Amount] >= 0
		AND min([LoyaltyProgramSales].[IDSale])
	OVER (PARTITION BY [LoyaltyProgramSales].[AccountID], [LoyaltyProgramSales].[Period]) = [LoyaltyProgramSales].[IDSale]) THEN
	1
	ELSE 0
	END AS is_first_daily_purchase,
	CASE
	WHEN ([LoyaltyProgramSales].[Amount] >= 0
		AND [Account].[AccountDate] = [LoyaltyProgramSales].[Period]
		AND min([LoyaltyProgramSales].[IDSale])
	OVER (PARTITION BY [LoyaltyProgramSales].[AccountID], [LoyaltyProgramSales].[Period]) = [LoyaltyProgramSales].[IDSale]) THEN
	1
	ELSE 0
	END AS is_new_account, coalesce([Account].[StatusLP], -1) AS status_lp, [LoyaltyProgramSales].[PaymentType], [Product].[Name] AS name, [LoyaltyProgramSales].[ProductID] AS price_ext_id, abs([LoyaltyProgramSales].[Quantity]) AS count, abs([LoyaltyProgramSales].[Amount]) AS total, [ProductCategory_hierarchy].cat AS prod_category, [LoyaltyProgramSales].[DocumentLines] AS line_count
FROM [LoyaltyProgramSales] LEFT OUTER
JOIN [Employee]
	ON [Employee].[Id] = [LoyaltyProgramSales].[EmployeeID] LEFT OUTER
JOIN [Account]
	ON [Account].[Id] = [LoyaltyProgramSales].[AccountID] LEFT OUTER
JOIN [Product]
	ON [Product].[Id] = [LoyaltyProgramSales].[ProductID] LEFT OUTER
JOIN [ProductCategory_hierarchy]
	ON [ProductCategory_hierarchy].[Id] = [Product].[ProductCategory] LEFT OUTER
JOIN [Store]
	ON [Store].[Id] = [LoyaltyProgramSales].[StoreID] LEFT OUTER
JOIN [Store] AS [Store_1]
	ON [Store].[Parent_1CID] = [Store_1].[1C_Id]
ORDER BY  [LoyaltyProgramSales].[ModifiedDate], ext_id, store_ext_id

