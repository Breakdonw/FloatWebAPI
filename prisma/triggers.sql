CREATE OR REPLACE FUNCTION recalculate_balance() 
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate the balance by summing up transactions for the specific account
  UPDATE "UserAccount"
  SET balance = COALESCE((
    SELECT SUM(
      CASE 
        WHEN t.type = 'income' OR t.type = 'savingsDeposit' THEN t.amount
        WHEN t.type = 'purchase' OR t.type = 'creditCardPayment' THEN -t.amount
        ELSE 0
      END
    ) 
    FROM "Transactions" t 
    WHERE t.accountid = NEW.accountid
  ), 0)
  WHERE id = NEW.accountid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER recalculate_balance_trigger
AFTER INSERT OR UPDATE OR DELETE
ON "Transactions"
FOR EACH ROW
EXECUTE FUNCTION recalculate_balance();
