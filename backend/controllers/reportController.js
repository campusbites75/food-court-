const monthlyReport = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const orders = await orderModel.find({
      createdAt: { $gte: start, $lt: end },
    });

    const delivered = orders.filter(o => o.status === "delivered");
    const rejected = orders.filter(o => o.status === "rejected");

    const totalRevenue = delivered.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    let PackedSales = 0;
    let UnpackedSales = 0;

    const itemMap = {};

    orders.forEach(order => {
      order.items?.forEach(i => {
        const price = Number(i.price) || 0;
        const qty = Number(i.quantity) || 0;
        const amount = price * qty;

        // ✅ FIXED NORMALIZATION
        const type = (i.productType || "")
          .toString()
          .trim()
          .toLowerCase();

        if (type === "packed") {
          PackedSales += amount;
        } else {
          UnpackedSales += amount;
        }

        // Top selling items
        itemMap[i.name] = (itemMap[i.name] || 0) + qty;
      });
    });

    const topItems = Object.entries(itemMap).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      success: true,
      totalOrders: orders.length,
      delivered: delivered.length,
      rejected: rejected.length,
      totalRevenue,
      PackedSales,
      UnpackedSales,
      orders,
      topItems,
    });

  } catch (err) {
    console.error("MONTHLY REPORT ERROR:", err);
    res.status(500).json({ message: "Failed to load monthly report" });
  }
};